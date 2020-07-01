import { AnimatePresence } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactResizeDetector from "react-resize-detector";
import { useLocation, useHistory } from "react-router-dom";

import { connectWebSocket, joinRoom, store } from "@client/scrum";
import BackgroundCardsCanvas from "@client/ui/Background/BackgroundCardsCanvas";
import HostRoom from "@client/ui/HostRoom";
import LeaveRoomButton from "@client/ui/LeaveRoomButton";
import MiniLogo from "@client/ui/MiniLogo";
import PageLoader from "@client/ui/PageLoader";
import PlayRoom from "@client/ui/PlayRoom";
import { absFullSize } from "@client/ui/styles";
import { GlobalStyles } from "@client/ui/theme";
import { SlideAnimate } from "@client/util/animations";
import $, { StylixProps } from "stylix";
import { delay } from "@shared/util";

import Home from "./Home";

export const cardRatio = 1.3;

export default function ScrumdogApp({ ...other }: StylixProps) {
  const [size, setSize] = useState<[number, number]>([0, 0]);
  const handleResize = useCallback((w, h) => {
    setSize([w, h]);
  }, []);

  const [state, room, me] = store.useState((s) => [s.state, s.room, s.me]);

  const isHost = me.host;

  const ref = useRef<HTMLDivElement>(null);

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

      const state = store.get();

      if (urlRoomCode) {
        await joinRoom(urlRoomCode);
      } else if (state.me?._id) {
        const { room, users } = await connectWebSocket();
        store.update((s) => {
          s.state = "";
          s.room = room;
          s.users = users || [];
        });
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
      {/*<BackgroundCardsCanvas key="BackgroundCardsCanvas" z-index={-1} {...absFullSize} />*/}

      {state !== "pending" && (
        <>
          <$.div
            data-label="ScrumdogApp-content"
            {...absFullSize}
            $css={{
              "& > *": absFullSize,
            }}
          >
            <AnimatePresence>
              {state === "creating-room" || state === "loading" || state === "joining-room" ? (
                <PageLoader key="PageLoader" label={state === "creating-room" ? "creating room..." : "loading..."} />
              ) : room?.code ? (
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
            {!!room?.code && !state && (
              <SlideAnimate distance={-135} key="LeaveRoomButton">
                <LeaveRoomButton position="absolute" top={20} right={20} />
              </SlideAnimate>
            )}
            {(!!room?.code || state === "creating-room" || state === "joining-room") && (
              <SlideAnimate distance={-135} key="MiniLogo">
                <MiniLogo position="absolute" top={20} left={35} />
              </SlideAnimate>
            )}
          </AnimatePresence>
        </>
      )}
      <ReactResizeDetector handleHeight handleWidth onResize={handleResize} />
    </$.div>
  );
}
