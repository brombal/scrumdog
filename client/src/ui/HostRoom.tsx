import { faCopy } from "@fortawesome/pro-light-svg-icons";
import { faPlay, faSquare } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ButtonBase, TextField, Tooltip } from "@material-ui/core";
import { AnimatePresence, motion, usePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useIdle } from "react-use";
import $, { StylixProps } from "stylix";

import { endVote, startVote, store, updateRoom } from "@client/scrum";
import { PlayerCard } from "@client/ui/Cards";
import CardStack, { ShuffleState } from "@client/ui/CardStack";
import CopyTooltip from "@client/ui/CopyTooltip";
import HostDeck from "@client/ui/HostDeck";
import RoomHeader from "@client/ui/RoomHeader";
import { absFullSize, flexCentered } from "@client/ui/styles";
import UserNameInput from "@client/ui/UserNameInput";
import { ZoomAnimate } from "@client/util/animations";
import useLatestValue from "@client/util/useLatestValue";
import usePresenceTimer from "@client/util/usePresenceTimer";

type HostRoomProps = {};

export default function HostRoom({ ...other }: HostRoomProps & StylixProps) {
  const _room = store.useState((s) => s.room);
  const room = useLatestValue(_room);
  const users = store.useState((s) => s.users);
  const visibleUsers = useLatestValue(users, (users) => users?.length > 1);

  const idle = useIdle(1000, true);

  const isPresent = usePresenceTimer(1000);

  type HostMode = "" | "waiting" | "lobby";

  function determineMode(currentMode: HostMode, idle: boolean): HostMode {
    if (!isPresent) return "";

    // users includes host, so length must be >= 2
    if (users?.length > 1 && (currentMode !== "waiting" || idle)) {
      return "lobby";
    } else if ((+users?.length || 0) <= 1) {
      return "waiting";
    }
    return currentMode;
  }

  const [mode, setMode] = useState<HostMode>(() => determineMode("", idle));

  useEffect(() => {
    setMode((mode) => determineMode(mode, idle));
  }, [idle, isPresent, users?.length]);

  const roomUrl = `${window.location.protocol}//${window.location.host}/${room.code}`;

  const isVoting = room?.state === "voting";

  const [shuffleState, setShuffleState] = useState<ShuffleState>([false, ""]);

  return (
    <$.div
      data-label="HostRoom"
      pointer-events={mode ? "auto" : "none"}
      display="flex"
      flex-direction="column"
      {...other}
    >
      {/* top room code / user name */}
      <$.div data-label="PlayRoom-header" flex="0 0 100px" display="flex" align-items="center" justify-content="center">
        <AnimatePresence>{mode === "lobby" && <RoomHeader roomCode={room.code} roomUrl={roomUrl} />}</AnimatePresence>
      </$.div>

      <$.div data-label="HostRoom-content" flex="1 1 auto" display="flex" flex-direction="column">
        {/* name / description input */}
        <$.div data-label="HostRoom-input" position="relative" height="3rem" flex="0 0 auto" padding-top={10}>
          <AnimatePresence>
            <ZoomAnimate key={mode} {...absFullSize} {...flexCentered}>
              {mode === "waiting" && <UserNameInput />}
              {mode === "lobby" && (
                <$.div {...flexCentered}>
                  <$
                    $el={TextField}
                    value={_room?.description}
                    onChange={(e) => updateRoom({ description: e.target.value })}
                    placeholder="issue / ticket / description"
                    flex="1 1 auto"
                    width="35vw"
                    text-align="center"
                    font-size="0.8rem"
                    InputProps={{ inputProps: { maxLength: 100 } }}
                    $css={{
                      input: {
                        textAlign: "center",
                      },
                    }}
                  />
                  <$
                    $el={motion.div}
                    flex="1 1 auto"
                    padding-left="0.4em"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Tooltip title={isVoting ? "Stop Vote" : "Start Vote"} arrow placement="bottom">
                      <$
                        font-size="1rem"
                        cursor="pointer"
                        data-label="StartVoteButton"
                        $el={ButtonBase}
                        width="1.6em"
                        height="1.6em"
                        border-radius="50%"
                        background="white"
                        display="block"
                        {...flexCentered}
                        onClick={isVoting ? endVote : startVote}
                      >
                        {isVoting ? (
                          <$ $el={FontAwesomeIcon} font-size="0.6em" color="#333" icon={faSquare} />
                        ) : (
                          <$ $el={FontAwesomeIcon} font-size="0.6em" margin-left="0.1em" color="#333" icon={faPlay} />
                        )}
                      </$>
                    </Tooltip>
                  </$>
                </$.div>
              )}
            </ZoomAnimate>
          </AnimatePresence>
        </$.div>

        {/* user cards */}
        <$.div data-label="HostRoom-user-wrap" position="relative" flex="1 1 auto">
          <AnimatePresence>
            {isPresent && (
              <ZoomAnimate key={mode} {...absFullSize} {...flexCentered}>
                {mode === "waiting" && (
                  <$.div {...flexCentered} flex-direction="column" padding-bottom="2rem">
                    <$.div font-size="0.8rem" line-height="normal" letter-spacing={1}>
                      room code
                    </$.div>
                    <$.div font-size="2.6rem" font-weight={700} line-height={1}>
                      {room.code}
                    </$.div>
                    <CopyTooltip title="Click to copy" url={roomUrl}>
                      <$.div font-size="0.8rem" text-decoration="underline" letter-spacing={1} margin-bottom="1.4rem">
                        {roomUrl}
                        <$ $el={FontAwesomeIcon} icon={faCopy} margin-left={10} font-size={24} />
                      </$.div>
                    </CopyTooltip>

                    <$
                      $el={motion.div}
                      font-size="0.8rem"
                      animate={{ scale: [1, 1.05], opacity: [0.4, 0.6] }}
                      $elProps={{ transition: { yoyo: Infinity, ease: "easeInOut" } }}
                    >
                      waiting for players...
                    </$>
                  </$.div>
                )}
                {mode === "lobby" && visibleUsers?.length && (
                  <CardStack cardWidth={3.2} cardHeight={4} shuffle={isVoting} onShuffleState={setShuffleState}>
                    {users
                      .filter((u) => !u.host)
                      .map((u) => (
                        <PlayerCard
                          key={u._id}
                          size={1}
                          name={u.name}
                          showInitials={!shuffleState[0] && (!shuffleState[1] || shuffleState[1] === "unstack")}
                          checked={!isVoting && u.ready}
                          vote={u.vote}
                        />
                      ))}
                  </CardStack>
                )}
              </ZoomAnimate>
            )}
          </AnimatePresence>
        </$.div>
      </$.div>

      {/* card deck */}
      <$.div flex="0 0 auto" height={60}>
        <HostDeck visible={isPresent && !!room.deck} half={mode === "lobby"} margin-top={-40} />
      </$.div>
    </$.div>
  );
}
