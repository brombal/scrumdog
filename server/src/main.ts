require("dotenv-expand")(require("dotenv").config());

import bodyParser from "body-parser";
import express from "express";
import http from "http";
import socketio from "socket.io";

import {
  castVoteEvent,
  createRoomEvent,
  idEvent,
  joinRoomEvent,
  leaveRoomEvent,
  resetVoteEvent,
  roomClosedEvent,
  roomUpdatedEvent,
  setUserReadyEvent,
  updateRoomEvent,
  updateUserNameEvent,
  userJoinedEvent,
  userLeftEvent,
  userUpdatedEvent,
  voteResetEvent,
} from "@shared/socket";
import { Room, roomSendable, roomUpdatable, userSendable } from "@shared/types";
import { delay } from "@shared/util";

import { connect } from "./db";
import html from "./html";
import {
  createRoom,
  endUserSession,
  findRoomByCode,
  findRoomPlayers,
  findUserForSocket,
  findUserRoom,
  registerUser,
  removeUserSocket,
  updateAllPlayers,
  updateRoom,
  updateUser,
} from "./queries";

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io?.on("connection", async (socket) => {
  idEvent.on(socket, async ({ id, name }) => {
    await delay(1);

    const user = await registerUser(id, name, socket);
    const room = user && (await findUserRoom(user));

    if (!room) {
      return { user: userSendable(user), room: null, users: null };
    }

    socket.join(room.code);

    const players = await findRoomPlayers(room);
    return { user: userSendable(user), room: roomSendable(room), users: players.map(userSendable) };
  });

  createRoomEvent.on(socket, async () => {
    await delay(1);

    let user = await findUserForSocket(socket);
    if (!user) return null;

    const room = await createRoom();
    user = await updateUser(user, { room: room.code, host: true });

    socket.join(room.code);
    return { room: roomSendable(room), users: [userSendable(user)] };
  });

  updateRoomEvent.on(socket, async (updates: Partial<Room>) => {
    const user = await findUserForSocket(socket);
    const room = await updateRoom(user.room, roomUpdatable(updates));

    if ("state" in updates) {
      await updateAllPlayers(room.code, { vote: "", ready: false });
    }

    roomUpdatedEvent.emit(socket.to(room.code), room);
  });

  joinRoomEvent.on(socket, async (roomCode: string) => {
    await delay(1);

    const room = await findRoomByCode(roomCode);

    if (room) {
      socket.join(room.code);

      let user = await findUserForSocket(socket);
      if (user.room !== room.code) {
        user = await updateUser(user, { room: room.code, host: false });
        userJoinedEvent.emit(socket.to(room.code), userSendable(user));
      }

      const players = await findRoomPlayers(room);

      return { room: roomSendable(room), users: players.map(userSendable) };
    } else {
      return null;
    }
  });

  updateUserNameEvent.on(socket, async (name) => {
    let user = await findUserForSocket(socket);
    user = await updateUser(user, { name });
    const room = await findUserRoom(user);
    userUpdatedEvent.emit(socket.to(room.code), userSendable(user));
  });

  leaveRoomEvent.on(socket, async () => {
    const user = await findUserForSocket(socket);
    if (user) {
      await endUserSession(user);
      if (user.host) {
        await updateAllPlayers(user.room, { vote: "" });
        roomClosedEvent.emit(socket.to(user.room));
      } else {
        userLeftEvent.emit(socket.to(user.room), userSendable(user));
      }
    }
    socket.leaveAll();
  });

  castVoteEvent.on(socket, async (vote) => {
    let user = await findUserForSocket(socket);
    user = await updateUser(user, { vote });
    userUpdatedEvent.emit(socket.to(user.room), userSendable(user));
  });

  resetVoteEvent.on(socket, async () => {
    const user = await findUserForSocket(socket);
    await updateAllPlayers(user.room, { vote: "" });
    voteResetEvent.emit(socket.to(user.room));
  });

  setUserReadyEvent.on(socket, async (ready) => {
    let user = await findUserForSocket(socket);
    user = await updateUser(user, { ready });
    userUpdatedEvent.emit(socket.to(user.room), userSendable(user));
  });

  socket.on("disconnect", async () => {
    await removeUserSocket(socket);
  });
});

app.set("etag", false);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/*", (req, res) => {
  res.send(html);
});

(async () => {
  await connect();
  server.listen(process.env.PORT, () => console.log(`App listening at http://localhost:${process.env.PORT}`));
})();
