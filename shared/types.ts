import { ObjectId } from "mongodb";
import { cleanObject } from "./util";

export interface User {
  _id: ObjectId | string;
  name: string;
  room: string;
  host: boolean;
  me: boolean;
  vote: DeckCardValue;
  ready: boolean;
  sockets: string[];
}

export interface Room {
  _id: ObjectId | string;
  code: string;
  description: string;
  deck: Deck;
  state: "" | "voting";
}

export type DeckCardValue = string;
export type DeckDefinition = [DeckCardValue, boolean][];
export type DeckCollection = { [key: string]: DeckDefinition };
export type Deck = DeckCardValue[];

// values allowed to be updated directly by user
export function roomUpdatable(room: Partial<Room>): Room {
  return cleanObject({ description: room?.description, deck: room?.deck, state: room?.state }) as Room;
}

// values allowed to be written to database
export function roomSavable(room: Partial<Room>): Room {
  return { code: room?.code, description: room?.description, deck: room?.deck, state: room?.state } as Room;
}

// values allowed to be sent to user
export function roomSendable(room: Partial<Room>): Room {
  return room as Room;
}

// values allowed to be updated by user
export function userUpdatable(user: Partial<User>): User {
  return { name: user?.name, ready: user?.ready } as User;
}

// values allowed to be written to database
export function userSavable(user: Partial<User>): User {
  return { name: user?.name, room: user?.room, host: user?.host, sockets: user?.sockets, ready: user?.ready } as User;
}

// values allowed to be sent to user
export function userSendable(user: Partial<User>): User {
  return cleanObject({ _id: user?._id, name: user?.name, vote: user?.vote, host: user?.host || undefined, ready: user?.ready }) as User;
}
