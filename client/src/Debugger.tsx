import React, { useState } from "react";
import $ from "@stylix/core";

import { roomClosedEvent } from "server/shared/socket";
import { decks } from "server/shared/values";

import {
  castVote,
  createRoom,
  endVote,
  filterHost,
  filterPlayer,
  joinRoom,
  leaveRoom,
  promptJoinRoom,
  resetVote,
  startVote,
  store,
  toggleDeckCard,
  toggleReady,
  updateUserName,
  useSocketConnectedEffect,
} from "./scrum";

export default function Debugger() {
  const state = store.useState((s) => s);
  const isHost = store.get().me.host;
  const [roomCodeInput, setRoomCodeInput] = useState(state.room?.code || "");

  // useEffect(() => {
  //   if (state.room?.code) setRoomCodeInput(state.room.code);
  // }, [state.room?.code]);

  useSocketConnectedEffect((connected) => {
    if (connected)
      return roomClosedEvent.on(window.socket, () => {
        setRoomCodeInput("");
      });
  });

  return (
    <$.div display="flex" font-size="16px">
      <$.div flex="1 1 30%" backgroundColor="#EEEEEE" padding={10}>
        <div>Is host: {isHost ? "yes" : "no"}</div>
        <div>
          Store: <pre>{JSON.stringify(store.get(), null, 2)}</pre>
        </div>
      </$.div>
      <$.div flex="1 1 70%" padding={10}>
        <div>
          Name: <input value={state.me.name} onChange={(e) => updateUserName(e.target.value)} />
        </div>

        {state.state === "room-closed" ? (
          <>
            Room closed! <button onClick={() => store.update((s) => (s.state = ""))}>Reset</button>
          </>
        ) : state.state === "connecting" || (!state.state && state.room?.code && !state.connected) ? (
          <>Connecting...</>
        ) : state.state === "joining-room" ? (
          <>Joining room...</>
        ) : state.state === "creating-room" ? (
          <>Creating room...</>
        ) : state.state === "prompt-join" ? (
          <form
            onSubmit={(e) => {
              joinRoom(roomCodeInput);
              e.preventDefault();
            }}
          >
            <input
              placeholder="Room code"
              maxLength={4}
              value={roomCodeInput || ""}
              onChange={(e) => setRoomCodeInput(e.target.value)}
            />
            <button type="submit">Join</button>
          </form>
        ) : state.room?.code ? (
          <>
            {isHost ? (
              <>
                <div>Hosting room {state.room.code}</div>
                <div>
                  Description:{" "}
                  <input
                    value={state.room.description || ""}
                    onChange={(e) => store.update((s) => (s.room.description = e.target.value))}
                  />
                </div>
                <div>
                  <div>Deck</div>
                  <div>
                    {decks.scrum.map(([value]) => (
                      <$.span
                        key={value}
                        margin-right={5}
                        padding={5}
                        width={30}
                        height={40}
                        border-radius={5}
                        display="inline-flex"
                        align-items="center"
                        justify-content="center"
                        background={state.room.deck?.includes(value) ? "#333" : "#EEE"}
                        color={state.room.deck?.includes(value) ? "white" : "black"}
                        onClick={() => toggleDeckCard(value)}
                      >
                        {value}
                      </$.span>
                    ))}
                  </div>
                </div>

                {state.room.state === "voting" ? (
                  <div>
                    <div>voting!</div>
                    <button onClick={resetVote}>Reset vote</button>
                    <button onClick={endVote}>End vote</button>
                  </div>
                ) : (
                  <div>
                    <button onClick={startVote} disabled={!state.users.filter(filterPlayer).length}>
                      Start vote
                    </button>
                  </div>
                )}

                <div>
                  <button onClick={leaveRoom}>Leave room</button>
                </div>

                {!state.users.filter(filterPlayer).length && <div>Waiting for players...</div>}
              </>
            ) : (
              <>
                <div>In room {state.room.code}</div>
                <div>Description: {state.room.description}</div>
                <div>Hosted by {state.users.find(filterHost)?.name}</div>

                {state.room.state === "voting" && (
                  <$.div display="flex">
                    {decks.scrum
                      .filter(([value]) => state.room.deck.includes(value))
                      .map(([value]) => {
                        const isMyVote = state.me.vote === value;
                        return (
                          <$.span
                            key={value}
                            margin-right={5}
                            padding={5}
                            width={30}
                            height={40}
                            border-radius={5}
                            display="inline-flex"
                            align-items="center"
                            justify-content="center"
                            background={isMyVote ? "#333" : "#EEE"}
                            color={isMyVote ? "white" : "black"}
                            onClick={() => castVote(value)}
                          >
                            {value}
                          </$.span>
                        );
                      })}
                  </$.div>
                )}
                <div>
                  <button onClick={leaveRoom}>Leave room</button>
                  <label>
                    <input type="checkbox" onChange={toggleReady} checked={state.me.ready} /> Ready
                  </label>
                </div>
              </>
            )}
            <div>
              Players:{" "}
              <ul>
                {state.users.filter(filterPlayer).map((u) => (
                  <li key={u._id}>
                    {u.name} {u.me ? "(me)" : ""} {u.vote && `(${u.vote})`}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <>
            <button onClick={createRoom}>Create room</button>
            <button onClick={promptJoinRoom}>Join room</button>
          </>
        )}
      </$.div>
    </$.div>
  );
}
