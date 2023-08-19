import { ObjectId } from "mongodb";

import { Room, User } from "server/shared/types";
import { cleanObject } from "server/shared/util";
import { defaultDeck } from "server/shared/values";

import { db } from "./db";

const rooms = () => db().collection<Room>("rooms");
const users = () => db().collection<User>("users");

export async function registerUser(userId: string, name: string, socket): Promise<User> {
  if (userId && ObjectId.isValid(userId)) {
    const { value } = await users().findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $push: { sockets: socket.id }, $set: { name } },
      { upsert: true, returnOriginal: false }
    );
    return value;
  } else {
    const { insertedId } = await users().insertOne({ sockets: [socket.id], name } as User);
    return { _id: (insertedId as ObjectId).toHexString(), name } as User;
  }
}

export function removeUserSocket(socket) {
  return users().updateOne({ sockets: socket.id }, { $pull: { sockets: socket.id } });
}

export function findUserForSocket(socket): Promise<User> {
  return users().findOne({ sockets: socket.id });
}

export function findRoomByCode(code: string): Promise<Room> {
  return rooms().findOne({
    code: (code || "").toUpperCase(),
  });
}

function generateCode() {
  const letters = "23456789BCDFGHJKLMNPQRSTVWXYZ".split("");
  return [0, 1, 2, 3].map(() => letters.splice(Math.floor(Math.random() * letters.length), 1)).join("");
}

async function createRoomCode(): Promise<string> {
  let code: string;
  do {
    code = generateCode();
  } while (await rooms().countDocuments({ code }));
  return code;
}

export async function createRoom(): Promise<Room> {
  const code = await createRoomCode();
  const room: any = { code, deck: defaultDeck() };
  await rooms().insertOne(room);
  return room;
}

export function findUserRoom(user): Promise<Room> {
  return rooms().findOne({
    code: user.room,
  });
}

export function setUserRoom(user: User, room, isHost: boolean): Promise<User> {
  return updateUser(user, { room: room.code, host: isHost });
}

export async function updateUser(user: User | string, updates: Partial<User>): Promise<User> {
  const res = await users().findOneAndUpdate(
    typeof user === "string" ? { _id: ObjectId.createFromHexString(user) } : { _id: user._id },
    { $set: cleanObject(updates) },
    { returnOriginal: false }
  );
  return res.value;
}

export function findRoomPlayers(room): Promise<User[]> {
  return users().find({ room: room.code }).toArray();
}

export async function updateRoom(room: Room | string, updates: Partial<Room>): Promise<Room> {
  const res = await rooms().findOneAndUpdate(
    typeof room === "string" ? { code: room } : { _id: room._id },
    { $set: cleanObject(updates) },
    { returnOriginal: false }
  );
  return res.value;
}

export async function updateAllPlayers(room: Room | string, updates: Partial<User>): Promise<void> {
  await users().updateMany({ room: typeof room === "string" ? room : room.code }, { $set: cleanObject(updates) });
}

export async function endUserSession(user) {
  if (user.host) {
    // Delete room where user is host
    const room = await findUserRoom(user);
    if (room) await rooms().deleteOne({ _id: room._id });
  } else {
    // Remove user as player from all rooms
    await users().updateOne({ _id: user._id }, { $set: { room: null, vote: "" } });
  }
}
