import { DeckCardValue, Room, User } from "./types";

// Client event

// // Create event object
// const updateRoom = createClientEvent<Input1Type, Input2Type, ReturnType>('update-room')

// // .emit event from client
// const response: ReturnType = await updateRoom.emit(socket, input1, input2);

// // listen to event on server
// updateRoom.on(socket, (input1: Input1Type, input2: Input2Type) => {
//   return returnValue as ReturnType;
// });

// Server event

// // Create event object
// const userUpdated = createServerEvent<Input1Type, Input2Type>('user-updated'); // No return type

// // .emit event from server
// userUpdated.emit(socket.to(room), input1, input2);

// // Listen to event on client
// userUpdated.on(socket, (input1: Input1Type, input2: Input2Type) => {
//   // no return value
// });

interface Socket {
  on(...args: any[]): any;
  off(...args: any[]): any;
  emit(...args: any[]): any;
}

interface ClientEvent<TInput, TReturn> {
  emit(socket: any, input?: TInput): TReturn extends void ? void : Promise<TReturn>;
  on(socket: any, action: (input1: TInput) => Promise<TReturn>): () => void;
}

function createClientEvent<TInput, TReturn = void>(name: string): ClientEvent<TInput, TReturn> {
  return {
    emit(socket: Socket, input: TInput): TReturn extends void ? void : Promise<TReturn> {
      return new Promise((resolve) => {
        console.log("socket: client emit:", name, input);
        socket?.emit(name, input, (result: TReturn) => {
          console.log("socket: client emit: response:", name, result);
          resolve(result);
        });
      }) as any;
    },
    on(socket: Socket, action) {
      socket?.on(name, async (input: TInput, cb) => {
        console.log("socket: handle client event:", name, input);
        const result = await action(input);
        if (typeof result !== "undefined") cb(result);
      });
      return () => socket?.off(name, action);
    },
  };
}

interface ServerEvent<TInput> {
  emit(socket: any, input?: TInput): void;
  on(socket: any, action: (input1: TInput) => void): () => void;
}

function createServerEvent<TInput>(name: string): ServerEvent<TInput> {
  return {
    emit(socket: Socket, input: TInput) {
      console.log("socket: server emit:", name, input);
      socket?.emit(name, input);
    },
    on(socket: Socket, action) {
      socket?.on(name, (input) => {
        console.log("socket: handle server event:", name, input);
        action(input);
      });
      return () => socket?.off(name, action);
    },
  };
}

export const updateRoomEvent = createClientEvent<Partial<Room>>("update-room");
export const idEvent = createClientEvent<{ id: string; name: string }, { user: User; room: Room; users: User[] }>("id");
export const createRoomEvent = createClientEvent<never, { room: Room; users: User[] }>("host-room");
export const joinRoomEvent = createClientEvent<string, { room: Room; users: User[] }>("join-room");
export const updateUserNameEvent = createClientEvent<string>("update-user-name");
export const leaveRoomEvent = createClientEvent<never>("leave-room");
export const resetVoteEvent = createClientEvent<never>("reset-vote");
export const castVoteEvent = createClientEvent<DeckCardValue>("cast-vote");
export const setUserReadyEvent = createClientEvent<boolean>("user-ready");

export const roomUpdatedEvent = createServerEvent<Partial<Room>>("room-updated");
export const userJoinedEvent = createServerEvent<User>("user-joined");
export const userUpdatedEvent = createServerEvent<User>("user-updated");
export const userLeftEvent = createServerEvent<User>("user-left");
export const roomClosedEvent = createServerEvent<void>("room-closed");
export const voteResetEvent = createServerEvent<void>("vote-started");
