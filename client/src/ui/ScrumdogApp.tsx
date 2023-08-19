import { faBomb } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CircularProgress } from '@mui/material';
import $, { type StylixProps, useGlobalStyles } from '@stylix/core';
import { AnimatePresence, motion } from 'framer-motion';
import { unwrap } from 'keck';
import { cloneDeep } from 'lodash-es';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { useLocation } from 'wouter';

import { joinRoom, useScrumdogStore } from 'client/scrum';
import LeaveRoomButton from 'client/ui/LeaveRoomButton';
import MiniLogo from 'client/ui/MiniLogo';
import { absFullSize, flexCentered } from 'client/ui/styles';
import { FadeAnimate, SlideAnimate } from 'client/util/animations';
import { delay } from 'server/shared/util';

import Home from './Home';

export const cardRatio = 1.3;

export default function ScrumdogApp({ ...other }: StylixProps) {
  const store = useScrumdogStore();
  const isHost = !!store.me?.host;

  const ref = useRef<HTMLDivElement>(null);

  const [location] = useLocation();

  useEffect(() => {
    (async () => {
      store.state = 'loading';

      await delay(1.5);

      // Check the room code in the url when the app mounts
      let urlRoomCode: string | null = location.replace(/^\//, '');
      if (urlRoomCode.length !== 4) urlRoomCode = null;

      if (urlRoomCode) {
        await joinRoom(urlRoomCode);
      } else {
        store.state = '';
      }
    })();
  }, []);

  useEffect(() => {
    if (!store.state) window.history.replaceState(null, '', '/' + (store.room?.code || ''));
  }, [store.state, store.room?.code]);

  const [size, setSize] = useState<[number, number]>([0, 0]);
  const handleResize = useCallback((w, h) => {
    setSize([w, h]);
  }, []);

  const fontSize = Math.max(22, Math.min(size[0], size[1]) / 20) + 'px';

  useGlobalStyles({
    html: {
      fontSize,
    },
  });

  console.log('ScrumdogApp', { error: store.error });

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
      {/*<BackgroundCardsCanvas key="BackgroundCardsCanvas" z-index={-1} {...absFullSize} />*/}

      {store.state !== 'pending' && (
        <>
          <$.div
            z-index={1}
            data-label="ScrumdogApp-content"
            {...absFullSize}
            $css={{
              '& > *': absFullSize,
            }}
          >
            <AnimatePresence>
              {!store.error &&
              store.room?.code &&
              !(store.state === 'creating-room' || store.state === 'loading' || store.state === 'joining-room') ? (
                isHost ? (
                  <$.div key="HostRoom">host room</$.div>
                ) : (
                  <$.div key="PlayRoom">play room</$.div>
                )
              ) : (
                <Home key="Home" />
              )}
            </AnimatePresence>
          </$.div>

          <AnimatePresence>
            {store.error && (
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

            {!!store.room?.code && !store.connected && (
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
                  $el={<motion.div transition={{ yoyo: Infinity, ease: 'easeInOut' }} />}
                  font-size="0.8rem"
                  animate={{ scale: [1, 1.05], opacity: [0.8, 1] }}
                  margin-top={20}
                >
                  Reconnecting...
                </$>
              </FadeAnimate>
            )}

            {!!store.room?.code && !store.state && (
              <SlideAnimate distance={-135} key="LeaveRoomButton" position="absolute" top={20} right={20} z-index={2}>
                <LeaveRoomButton roomCode={store.room?.code} />
              </SlideAnimate>
            )}
            {(!!store.room?.code || store.state === 'creating-room' || store.state === 'joining-room') && (
              <SlideAnimate distance={-135} key="MiniLogo">
                <MiniLogo position="absolute" top={20} left={35} z-index={2} />
              </SlideAnimate>
            )}
          </AnimatePresence>
        </>
      )}

      <ReactResizeDetector handleHeight handleWidth onResize={handleResize} />
    </$.div>
  );
}
