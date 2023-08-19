import { createObserver, unwrap, useObserver } from 'keck';
import { debounce, defaultsDeep, isEqual, merge, remove } from 'lodash-es';
import { useEffect } from 'react';
import io from 'socket.io-client';

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
} from 'server/shared/socket';
import { type DeckCardValue, type Room, roomUpdatable, type User } from 'server/shared/types';
import { cleanObject, toggleEntry, tryJsonParse } from 'server/shared/util';

declare global {
  interface Window {
    socket: SocketIOClient.Socket | null;
  }
}

type ScrumdogState = '' | 'pending' | 'loading' | 'room-closed' | 'joining-room' | 'creating-room' | 'prompt-join';

export interface ScrumdogStore {
  /**
   * The current state (such as "loading"). This is ephemeral and not saved in localStorage.
   */
  state: ScrumdogState;

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

export const storeData: ScrumdogStore = defaultsDeep(
  {
    state: 'pending',
    users: [],
    connected: false,
    error: false,
  },
  getLocalStorageState(),
  {
    me: { me: true, name: '' },
    room: {},
  },
) as ScrumdogStore;

export function useScrumdogStore() {
  return useObserver(storeData);
}

export const store = createObserver(storeData, () => null);

let socket: SocketIOClient.Socket | null;
let socketReconnectInterval: any;

export function getLocalStorageState() {
  return tryJsonParse(localStorage.getItem('ambient') || 'null') || {};
}

export const filterMe = (u: User) => u.me;

export const filterHost = (u: User) => u.host;

// Get all users that are not the host
export const filterPlayer = (u: User) => !u.host;

// Store in localStorage when serializable values change
createObserver(
  storeData,
  (s) => [s.room, s.me],
  () => {
    localStorage.setItem('ambient', JSON.stringify({ me: unwrap(store).me }));
  },
  isEqual,
);

// Whenever users array updates, use the matching entry for the "me" property
createObserver(
  storeData,
  (s) => s.users,
  () => {
    const me = store.users.find((u) => u._id === store.me._id);
    if (me) {
      store.me = me;
    }
  },
);

/**
 * Connects and initializes the websocket. This doesn't happen until the user joins a room, so it may be called
 * multiple times.
 *
 * - Identifies user, using saved localStorage user if available
 * - Updates the state with the user object
 * - Returns the user object.
 */
export async function connectWebSocket(): Promise<{ room: Room; users: User[] } | undefined> {
  if (socket) return;

  window.socket = socket = io(process.env.URL_SOCKET || '');

  socket.on('connect_error', (e) => {
    console.log('error', e);
    // if (e.type !== 'TransportError') {
      store.error = true;
      store.state = '';
    // }
  });

  socket.on('connect_timeout', (e) => {
    // ?
  });

  userJoinedEvent.on(socket, (user: User) => {
    store.users.push(user);
  });

  userUpdatedEvent.on(socket, (user: User) => {
    merge(
      store.users.find((p) => p._id === user._id),
      user,
    );
  });

  userLeftEvent.on(socket, (user: User) => {
    remove(store.users, (p) => p._id === user._id);
    if (user._id === store.me._id) {
      leaveRoom();
    }
  });

  roomUpdatedEvent.on(socket, (room: Partial<Room>) => {
    // When room state changes, reset vote for all users (this happens in db but we don't get update via socket)
    if (room.state !== store.room.state) {
      resetVoteState();
    }

    // When voting starts, reset all users' ready state
    if (room.state === 'voting') {
      store.me.ready = false;
      store.users.forEach((u) => (u.ready = false));
    }

    Object.assign(store.room, room);
  });

  voteResetEvent.on(socket, () => {
    resetVoteState();
  });

  roomClosedEvent.on(socket, () => {
    disconnectWebSocket();
    store.room = {} as Room;
    store.users = [];
    store.state = 'room-closed';
    store.connected = false;
  });

  socket.on('disconnect', () => {
    console.log('disconnected!');
    store.connected = false;
  });

  return new Promise((resolve) => {
    socket!.on('connect', (e) => {
      console.log('connected!', e);
      clearInterval(socketReconnectInterval);
      store.error = false;
      store.connected = true;

      const { me } = store;

      idEvent.emit(socket, { id: me._id as string, name: me.name }).then((result) => {
        store.me = result.user;
        resolve(result);
      });
    });
  });
}

function disconnectWebSocket() {
  socket?.removeAllListeners();
  socket?.close();
  window.socket = socket = null;
}

export async function joinRoom(code: string) {
  store.state = 'joining-room';

  await connectWebSocket();

  const { room, users } = (await joinRoomEvent.emit(socket, code)) || {};
  if (room) {
    store.state = '';
    store.room = room;
    store.users = users;
  } else {
    // error (no room)
    window.eventEmitter.emit('invalid-room', code);
    disconnectWebSocket();
    store.state = 'prompt-join';
  }
}

export async function createRoom() {
  // If already in a room, or doing something, quit
  if (store.room?.code || store.state) return;

  store.state = 'creating-room';

  await connectWebSocket();

  const { room, users } = await createRoomEvent.emit(window.socket);
  store.state = '';
  store.room = room;
  store.users = users;
}

export async function leaveRoom() {
  leaveRoomEvent.emit(socket);
  disconnectWebSocket();
  store.room = {} as Room;
  store.me.vote = '';
  store.users = [];
  store.state = '';
  store.connected = false;
}

function resetVoteState() {
  store.users.forEach((u) => (u.vote = ''));
  store.me.vote = '';
}

const emitUpdateRoomDebounced = debounce(function emitUpdateRoom(updates: Partial<Room>) {
  if (!store.connected || !store.me.host) return;
  updateRoomEvent.emit(socket, cleanObject(roomUpdatable(updates)));
}, 750);

export function updateRoom(updates: Partial<Room>) {
  if (!store.connected || !store.me.host) return;
  Object.assign(store.room, updates);
  emitUpdateRoomDebounced(updates);
}

export function toggleDeckCard(card: DeckCardValue) {
  toggleEntry(store.room.deck, card);
  updateRoom({ deck: store.room.deck });
}

export function promptJoinRoom() {
  store.state = 'prompt-join';
  store.room = {} as Room;
}

export function cancelPromptJoinRoom() {
  store.state = '';
  store.room = {} as Room;
}

const emitUpdateUserName = debounce(function emitUpdateUserName(name) {
  if (store.connected) updateUserNameEvent.emit(socket, name);
}, 750);

export function updateUserName(name) {
  store.me.name = name;
  // We also need to update the user's entry in the player list.
  const user = store.users.find(filterMe);
  if (user) user.name = name;
  emitUpdateUserName(name); // debounced
}

export function startVote() {
  updateRoomEvent.emit(socket, { state: 'voting' });
  store.room.state = 'voting';
}

export function castVote(value: DeckCardValue) {
  castVoteEvent.emit(socket, value);
  store.users.find(filterMe)!.vote = store.me.vote = value;
}

export function resetVote() {
  resetVoteEvent.emit(socket);
  store.users.forEach((u) => (u.vote = ''));
}

export function endVote() {
  updateRoomEvent.emit(socket, { state: '' });
  store.room.state = '';
  store.users.forEach((u) => {
    u.ready = false;
    u.vote = '';
  });
}

export function toggleReady() {
  setUserReadyEvent.emit(socket, !store.me.ready);
  store.me.ready = !store.me.ready;
  store.users.find((u) => u.me)!.ready = store.me.ready;
}

export function useSocketConnectedEffect(effect) {
  const state = useObserver(store);
  useEffect(() => {
    return effect(state.connected);
  }, [state.connected]);
}

export function getRoomUrl(roomCode: string) {
  return `${window.location.protocol}//${window.location.host}/${roomCode}`;
}
