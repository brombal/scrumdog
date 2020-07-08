import { faBomb } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CircularProgress } from "@material-ui/core";
import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactResizeDetector from "react-resize-detector";
import { useHistory, useLocation } from "react-router-dom";
import $, { StylixProps } from "stylix";

import { joinRoom, store } from "@client/scrum";
import BackgroundCardsCanvas from "@client/ui/Background/BackgroundCardsCanvas";
import HostRoom from "@client/ui/HostRoom";
import LeaveRoomButton from "@client/ui/LeaveRoomButton";
import MiniLogo from "@client/ui/MiniLogo";
import PlayRoom from "@client/ui/PlayRoom";
import { absFullSize, flexCentered } from "@client/ui/styles";
import { GlobalStyles } from "@client/ui/theme";
import { FadeAnimate, SlideAnimate } from "@client/util/animations";
import { EventContext, EventProvider } from "@client/util/useEvent";
import { delay } from "@shared/util";

import Home from "./Home";

export const cardRatio = 1.3;

export default function ScrumdogApp({ ...other }: StylixProps) {
  const [size, setSize] = useState<[number, number]>([0, 0]);
  const handleResize = useCallback((w, h) => {
    setSize([w, h]);
  }, []);

  const [error, state, connected, roomCode, isHost] = store.useState((s) => [
    s.error,
    s.state,
    s.connected,
    s.room?.code,
    !!s.me?.host,
  ]);

  const ref = useRef<HTMLDivElement>(null);

  const [eventContext] = useState(new EventContext());

  const location = useLocation();

  useEffect(() => {
    (async () => {
      store.update((s) => {
        s.state = "loading";
      });

      await delay(1.5);

      // Check the room code in the url when the app mounts
      let urlRoomCode = location.pathname.replace(/^\//, "");
      if (urlRoomCode.length !== 4) urlRoomCode = null;

      if (urlRoomCode) {
        await joinRoom(urlRoomCode, eventContext.emit);
      } else {
        store.update((s) => {
          s.state = "";
        });
      }
    })();
  }, []);

  const history = useHistory();
  store.useEffect(
    (state) => {
      if (!state.state) history.replace("/" + (state.room?.code || ""));
    },
    (s) => [s.state, s.room?.code]
  );

  return (
    <EventProvider value={eventContext}>
      <$.div
        data-label="ScrumdogApp"
        ref={ref}
        position="relative"
        background-color="#091D6F"
        color="rgba(255, 255, 255, 0.9)"
        z-index={1}
        overflow="hidden"
        {...other}
      >
        <GlobalStyles size={size} />
        <BackgroundCardsCanvas key="BackgroundCardsCanvas" z-index={-1} {...absFullSize} />

        {state !== "pending" && (
          <>
            <$.div
              z-index={1}
              data-label="ScrumdogApp-content"
              {...absFullSize}
              $css={{
                "& > *": absFullSize,
              }}
            >
              <AnimatePresence>
                {!error &&
                roomCode &&
                !(state === "creating-room" || state === "loading" || state === "joining-room") ? (
                  isHost ? (
                    <HostRoom key="HostRoom" />
                  ) : (
                    <PlayRoom key="PlayRoom" />
                  )
                ) : (
                  <Home key="Home" />
                )}
              </AnimatePresence>
            </$.div>

            <AnimatePresence>
              {error && (
                <FadeAnimate
                  key="error"
                  data-label="ScrumdogApp-disconnected"
                  background="rgba(0, 0, 0, 0.85)"
                  {...absFullSize}
                  {...flexCentered}
                  flex-direction="column"
                  z-index={3}
                >
                  <$ $el={FontAwesomeIcon} icon={faBomb} />
                  <$.div font-size="0.6rem" margin-top={20} text-align="center">
                    Sorry, there was a connection error...
                    <br />
                    try refreshing!
                  </$.div>
                </FadeAnimate>
              )}

              {!!roomCode && !connected && (
                <FadeAnimate
                  key="disconnected"
                  data-label="ScrumdogApp-disconnected"
                  background="rgba(0, 0, 0, 0.8)"
                  {...absFullSize}
                  {...flexCentered}
                  flex-direction="column"
                  z-index={3}
                >
                  <CircularProgress color="inherit" />
                  <$
                    $el={motion.div}
                    font-size="0.8rem"
                    animate={{ scale: [1, 1.05], opacity: [0.8, 1] }}
                    $elProps={{ transition: { yoyo: Infinity, ease: "easeInOut" } }}
                    margin-top={20}
                  >
                    Reconnecting...
                  </$>
                </FadeAnimate>
              )}

              {!!roomCode && !state && (
                <SlideAnimate distance={-135} key="LeaveRoomButton" position="absolute" top={20} right={20} z-index={2}>
                  <LeaveRoomButton roomCode={roomCode} />
                </SlideAnimate>
              )}
              {(!!roomCode || state === "creating-room" || state === "joining-room") && (
                <SlideAnimate distance={-135} key="MiniLogo">
                  <MiniLogo position="absolute" top={20} left={35} z-index={2} />
                </SlideAnimate>
              )}
            </AnimatePresence>
          </>
        )}
        <ReactResizeDetector handleHeight handleWidth onResize={handleResize} />
      </$.div>
    </EventProvider>
  );
}
