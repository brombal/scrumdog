import "@client/util/ambient/ambient-react";

import { debounce, defaultsDeep, merge, pick, remove } from "lodash-es";
import { useEffect } from "react";
import io from "socket.io-client";

import Ambient from "@client/util/ambient/ambient";
import { EventEmitter } from "@client/util/useEvent";
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
import { DeckCardValue, Room, roomUpdatable, User } from "@shared/types";
import { cleanObject, toggleEntry, tryJsonParse } from "@shared/util";

export interface ScrumdogStore {
  /**
   * The current state (such as "loading"). This is ephemeral and not saved in localStorage.
   */
  state: string;

  /**
   * Indicates that the socket is currently connected.
   */
  connected: boolean;

  error: boolean;

  /**
   * The room that the user is currently in
   */
  room: Room;
  me: User;
  users: User[];
}

let socket: SocketIOClient.Socket;
let socketReconnectInterval: any;

export function getLocalStorageState() {
  return tryJsonParse(localStorage.getItem("ambient")) || {};
}

export const store = new Ambient(
  defaultsDeep({ state: "pending", users: [], connected: false, error: false }, getLocalStorageState(), {
    me: { me: true, name: "" },
    room: {},
  }) as ScrumdogStore
);

export const filterMe = (u: User) => u.me;

export const filterHost = (u: User) => u.host;

// Get all users that are not the host
export const filterPlayer = (u: User) => !u.host;

// Store in localStorage when serializable values change
store.subscribe(
  (state) => {
    localStorage.setItem("ambient", JSON.stringify(pick(state, "me")));
  },
  (s) => [s.room, s.me]
);

// Whenever users array updates, use the matching entry for the "me" property
store.subscribe(
  () => {
    store.update((s) => {
      const me = s.users.find((u) => u._id === s.me._id);
      if (me) {
        s.me = me;
        s.me.me = true;
      }
    });
  },
  (s) => s.users
);

/**
 * Connects and initializes the websocket. This doesn't happen until the user joins a room, so it may be called
 * multiple times.
 *
 * - Identifies user, using saved localStorage user if available
 * - Updates the state with the user object
 * - Returns the user object.
 */
export async function connectWebSocket(): Promise<{ room: Room; users: User[] }> {
  if (socket) return;

  window.socket = socket = io(window.env.REACT_URL_SOCKET);

  socket.on("connect_error", (e) => {
    console.log("error", e);
    if (e.type !== "TransportError") {
      store.update((s) => (s.error = true));
    }
  });

  socket.on("connect_timeout", (e) => {
    // ?
  });

  userJoinedEvent.on(socket, (user: User) => {
    store.update((state) => {
      state.users.push(user);
    });
  });

  userUpdatedEvent.on(socket, (user: User) => {
    store.update((state) => {
      merge(
        state.users.find((p) => p._id === user._id),
        user
      );
    });
  });

  userLeftEvent.on(socket, (user: User) => {
    store.update((state) => {
      remove(state.users, (p) => p._id === user._id);
    });
    if (user._id === store.get().me._id) leaveRoom();
  });

  roomUpdatedEvent.on(socket, (room: Room) => {
    store.update((state) => {
      // When room state changes, reset vote for all users (this happens in db but we don't get update via socket)
      if (room.state !== state.room.state) {
        resetVoteState(state);
      }

      // When voting starts, reset all users' ready state
      if (room.state === "voting") {
        state.me.ready = false;
        state.users.forEach((u) => (u.ready = false));
      }

      Object.assign(state.room, room);
    });
  });

  voteResetEvent.on(socket, () => {
    store.update(resetVoteState);
  });

  roomClosedEvent.on(socket, () => {
    disconnectWebSocket();
    store.update((s) => {
      s.room = null;
      s.users = [];
      s.state = "room-closed";
      s.connected = false;
    });
  });

  socket.on("disconnect", () => {
    console.log("disconnected!");
    store.update((s) => (s.connected = false));
  });

  return new Promise((resolve) => {
    socket.on("connect", (e) => {
      console.log("connected!", e);
      clearInterval(socketReconnectInterval);
      store.update((s) => {
        s.error = false;
        s.connected = true;
      });

      const { me } = store.get();

      idEvent.emit(socket, { id: me._id, name: me.name }).then((result) => {
        store.update((s) => {
          s.me = result.user;
        });
        resolve(result);
      });
    });
  });
}

function disconnectWebSocket() {
  socket.removeAllListeners();
  socket.close();
  window.socket = socket = null;
}

export async function joinRoom(code: string, eventEmitter: EventEmitter) {
  store.update((s) => {
    s.state = "joining-room";
  });

  await connectWebSocket();

  const { room, users } = (await joinRoomEvent.emit(socket, code)) || {};
  if (room) {
    store.update((s) => {
      s.state = "";
      s.room = room;
      s.users = users;
    });
  } else {
    // error (no room)
    eventEmitter("invalid-room", code);
    disconnectWebSocket();
    store.update((s) => (s.state = "prompt-join"));
  }
}

export async function createRoom() {
  const state = store.get();

  // If already in a room, or doing something, quit
  if (state.room?.code || state.state) return;

  store.update((s) => {
    s.state = "creating-room";
  });

  await connectWebSocket();

  const { room, users } = await createRoomEvent.emit(window.socket);
  store.update((s) => {
    s.state = "";
    s.room = room;
    s.users = users;
  });
}

export async function leaveRoom() {
  leaveRoomEvent.emit(socket);
  disconnectWebSocket();
  store.update((s) => {
    s.room = null;
    s.me.vote = "";
    s.users = [];
    s.state = "";
    s.connected = false;
  });
}

function resetVoteState(state: ScrumdogStore) {
  state.users.forEach((u) => (u.vote = ""));
  state.me.vote = "";
}

const emitUpdateRoomDebounced = debounce(function emitUpdateRoom(updates: Partial<Room>) {
  if (!store.get().connected || !store.get().me.host) return;
  updateRoomEvent.emit(socket, cleanObject(roomUpdatable(updates)));
}, 750);

export function updateRoom(updates: Partial<Room>) {
  if (!store.get().connected || !store.get().me.host) return;
  store.update((s) => Object.assign(s.room, updates));
  emitUpdateRoomDebounced(updates);
}

export function toggleDeckCard(card: DeckCardValue) {
  const state = store.update((s) => toggleEntry(s.room.deck, card));
  updateRoom({ deck: state.room.deck });
}

export function promptJoinRoom() {
  store.update((s) => {
    s.state = "prompt-join";
    s.room = null;
  });
}

export function cancelPromptJoinRoom() {
  store.update((s) => {
    s.state = "";
    s.room = null;
  });
}

const emitUpdateUserName = debounce(function emitUpdateUserName(name) {
  if (store.get().connected) updateUserNameEvent.emit(socket, name);
}, 750);

export function updateUserName(name) {
  store.update((s) => {
    s.me.name = name;
    // We also need to update the user's entry in the player list.
    const user = s.users.find(filterMe);
    if (user) user.name = name;
  });
  emitUpdateUserName(name); // debounced
}

export function startVote() {
  updateRoomEvent.emit(socket, { state: "voting" });
  store.update((s) => (s.room.state = "voting"));
}

export function castVote(value: DeckCardValue) {
  castVoteEvent.emit(socket, value);
  store.update((s) => {
    s.users.find(filterMe).vote = s.me.vote = value;
  });
}

export function resetVote() {
  resetVoteEvent.emit(socket);
  store.update((s) => {
    s.users.forEach((u) => (u.vote = ""));
  });
}

export function endVote() {
  updateRoomEvent.emit(socket, { state: "" });
  store.update((s) => {
    s.room.state = "";
    s.users.forEach((u) => {
      u.ready = false;
      u.vote = "";
    });
  });
}

export function toggleReady() {
  setUserReadyEvent.emit(socket, !store.get().me.ready);
  store.update((s) => {
    s.me.ready = !s.me.ready;
    s.users.find((u) => u.me).ready = s.me.ready;
  });
}

export function useSocketConnectedEffect(effect) {
  const connected = store.useState((s) => s.connected);
  useEffect(() => {
    return effect(connected);
  }, [connected]);
}
