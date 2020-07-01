import { faCheck } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import color from "color";
import { AnimatePresence, usePresence } from "framer-motion";
import { sortBy } from "lodash-es";
import React, { useEffect, useState } from "react";
import $, { StylixProps } from "stylix";

import { castVote, store, toggleReady } from "@client/scrum";
import { PlayerCard, VoteCard } from "@client/ui/Cards";
import CardStack, { ShuffleState } from "@client/ui/CardStack";
import RoomHeader from "@client/ui/RoomHeader";
import { absFullSize, flexCentered } from "@client/ui/styles";
import VoteToast from "@client/ui/VoteToast";
import { ZoomAnimate } from "@client/util/animations";
import { delay } from "@shared/util";
import { decks } from "@shared/values";

import Button from "./Button";

export default function PlayRoom(other: StylixProps) {
  const [state, room, users, me] = store.useState((s) => [s.state, s.room, s.users, s.me]);
  const roomUrl = room && `${window.location.protocol}//${window.location.host}/${room.code}`;
  const host = users?.find((u) => u.host);

  const [isPresent, setSafeExit] = usePresence();
  useEffect(() => {
    !isPresent && setTimeout(() => setSafeExit(), 1000);
  }, [isPresent]);

  const isVoting = room?.state === "voting";

  const [showVoteToast, setShowVoteToast] = useState(false);
  useEffect(() => {
    (async () => {
      if (!isVoting) return;
      setShowVoteToast(true);
      await delay(1);
      setShowVoteToast(false);
    })();
  }, [isVoting]);

  const [shuffleState, setShuffleState] = useState<ShuffleState>([false, ""]);

  const deck = store.useState((s) => s.room?.deck);
  const sortedDeck = sortBy(deck, (roomCard) => decks.scrum.findIndex((deckCard) => deckCard[0] === roomCard));

  return (
    <$.div
      display="flex"
      flex-direction="column"
      data-label="HostRoom"
      pointer-events={isPresent ? "auto" : "none"}
      {...other}
    >
      {/* top room code / user name */}
      <$.div data-label="PlayRoom-header" flex="0 0 100px" display="flex" align-items="center" justify-content="center">
        <AnimatePresence>{isPresent && <RoomHeader roomCode={room?.code} roomUrl={roomUrl} />}</AnimatePresence>
      </$.div>

      <$.div
        data-label="PlayRoom-description"
        flex="0 0 2rem"
        padding-top="0.8rem"
        {...flexCentered}
        flex-direction="column"
      >
        {/* room description */}
        <AnimatePresence>
          {isPresent && (
            <>
              {host?.name && (
                <ZoomAnimate key="host" font-size="0.5rem" color={color("white").fade(0.4).string()}>
                  Hosted by {host.name}
                </ZoomAnimate>
              )}
              {room?.description && (
                <ZoomAnimate key="description" max-width="80vw" font-size="0.6rem">
                  {room.description}
                </ZoomAnimate>
              )}
            </>
          )}
        </AnimatePresence>
      </$.div>

      <$.div data-label="PlayRoom-upper" flex="1 1 auto" position="relative">
        {/* ready / playing cards */}
        <AnimatePresence>
          {isPresent &&
            (isVoting ? (
              <ZoomAnimate key="vote" {...absFullSize} {...flexCentered}>
                <CardStack cardWidth={3.2} cardHeight={4}>
                  {sortedDeck.map((value) => (
                    <VoteCard
                      key={value}
                      size={1}
                      selected={me.vote === value}
                      vote={value}
                      onClick={() => castVote(me.vote === value ? "" : value)}
                      cursor="pointer"
                      $css={{
                        "&:hover": { transform: `scale(${me.vote === value ? "1.25" : "1.05"})` },
                      }}
                    />
                  ))}
                </CardStack>
              </ZoomAnimate>
            ) : (
              <ZoomAnimate key="ready" {...absFullSize} {...flexCentered}>
                <Button onClick={toggleReady} filled={!!me.ready}>
                  <$ $el={FontAwesomeIcon} icon={faCheck} opacity={me.ready ? 1 : 0.4} margin-right={10} />
                  READY
                </Button>
              </ZoomAnimate>
            ))}
        </AnimatePresence>
      </$.div>

      <$.div
        data-label="PlayRoom-lower"
        flex="0 0 5rem"
        margin-bottom="0.2rem"
        {...flexCentered}
        align-items="flex-end"
      >
        <AnimatePresence>
          {/* players */}
          {isPresent && (
            <ZoomAnimate>
              <CardStack cardWidth={2} cardHeight={2.4} shuffle={isVoting} onShuffleState={setShuffleState}>
                {users
                  .filter((u) => !u.host && !u.me)
                  .map((u) => (
                    <PlayerCard
                      key={u._id}
                      size={0.6}
                      vote={u.vote}
                      name={u.name}
                      showInitials={!shuffleState[0] && (!shuffleState[1] || shuffleState[1] === "unstack")}
                      checked={u.ready}
                    />
                  ))}
              </CardStack>
            </ZoomAnimate>
          )}
        </AnimatePresence>
      </$.div>

      <VoteToast open={showVoteToast} />
    </$.div>
  );
}
