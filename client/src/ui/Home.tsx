import { faArrowCircleRight, faArrowLeft } from '@fortawesome/pro-light-svg-icons';
import { OutlinedInput, Slide, Snackbar } from '@mui/material';
import { red } from '@mui/material/colors';
import $, { type StylixProps } from '@stylix/core';
import { AnimatePresence } from 'framer-motion';
import React, { useRef, useState } from 'react';

import { cancelPromptJoinRoom, createRoom, joinRoom, promptJoinRoom, useScrumdogStore } from 'client/scrum';
import Button, { IconButton } from 'client/ui/Button';
import PageLoader from 'client/ui/PageLoader';
import { absFullSize, flexCentered } from 'client/ui/styles';
import { ZoomAnimate } from 'client/util/animations';
import { useEventEffect } from 'client/util/useEventEffect';
import useLatestValue from 'client/util/useLatestValue';
import usePresenceTimer from 'client/util/usePresenceTimer';

export default function Home({ ...other }: StylixProps) {
  const store = useScrumdogStore();
  const [error, state, roomCode] = [store.error, store.state, store.room?.code];
  const [roomCodeInput, setRoomCodeInput] = useState(roomCode || '');
  const isPresent = usePresenceTimer(1000);

  const [showInvalidRoom, setShowInvalidRoom] = useState('');
  const latestShowInvalidRoom = useLatestValue(showInvalidRoom);

  const timeoutRef = useRef<any>();

  useEventEffect(
    'invalid-room',
    (code) => {
      setShowInvalidRoom(code);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setShowInvalidRoom(''), 5000);
      return () => clearTimeout(timeoutRef.current);
    },
    [],
  );

  const showPageLoader = !error && (state === 'creating-room' || state === 'loading' || state === 'joining-room');

  return (
    <$.div
      data-label="Home"
      display="flex"
      align-items="stretch"
      justify-content="center"
      flex-direction="column"
      position="relative"
      padding="30px 15px"
      {...other}
    >
      <AnimatePresence mode="popLayout">
        {(isPresent || true) &&
          (showPageLoader ? (
            <PageLoader
              key="PageLoader"
              label={state === 'creating-room' ? 'creating room...' : 'loading...'}
              {...absFullSize}
            />
          ) : (
            <React.Fragment key="HomeWrapper">
              <ZoomAnimate key="logo" flex="0 0 auto" {...flexCentered} flex-direction="column" align-items="center">
                <$.img src={require('./ajax-white.png')} height="25vh" margin-bottom={10} />
                <$.img src={require('./logo.png')} max-width="80vw" height="15vh" margin-bottom={10} />
                <$.div font-size="24px" opacity={0.75}>
                  interactive planning poker
                </$.div>
                <$.div flex="0 1 auto" height="10vh" />
              </ZoomAnimate>
              <ZoomAnimate key="inputs" flex="0 0 3rem" position="relative">
                <AnimatePresence>
                  {!state && (
                    <$.div key="buttons" {...absFullSize} {...flexCentered} flex-wrap="wrap">
                      <Button margin={10} flex="1 1 auto" onClick={createRoom}>
                        CREATE ROOM
                      </Button>
                      <Button filled margin={10} flex="1 1 auto" onClick={promptJoinRoom}>
                        JOIN ROOM
                      </Button>
                    </$.div>
                  )}
                  {state === 'prompt-join' && (
                    <$.div key="prompt" {...absFullSize} {...flexCentered}>
                      <$.form
                        {...flexCentered}
                        onSubmit={(e) => {
                          joinRoom(roomCodeInput);
                          e.preventDefault();
                        }}
                      >
                        <IconButton
                          icon={faArrowLeft}
                          font-size="1em"
                          iconSize="0.6em"
                          onClick={cancelPromptJoinRoom}
                          margin-right="0.3em"
                        />
                        <$
                          $el={OutlinedInput}
                          value={roomCodeInput || ''}
                          inputProps={{
                            onKeyDown: (e) => {
                              if (e.key === 'Escape') cancelPromptJoinRoom();
                            },
                            maxLength: 4,
                          }}
                          autoFocus
                          onChange={(e) => setRoomCodeInput(e.target.value)}
                          placeholder="code"
                          $css={{
                            input: {
                              textAlign: 'center',
                              textTransform: 'uppercase',
                              fontWeight: 700,
                              width: '2.8em',
                              fontSize: '1.7em',
                              padding: '0.2em',
                            },
                            'input::placeholder': {
                              textTransform: 'none',
                              fontSize: '0.8em',
                              transform: 'translateY(-0.12em)',
                              fontWeight: 500,
                            },
                          }}
                        />
                        <IconButton
                          icon={faArrowCircleRight}
                          type="submit"
                          font-size="1em"
                          margin-left="0.3em"
                          disabled={roomCodeInput?.length !== 4}
                        />
                      </$.form>
                    </$.div>
                  )}
                </AnimatePresence>
              </ZoomAnimate>
            </React.Fragment>
          ))}
      </AnimatePresence>

      <$
        $el={Snackbar}
        open={!!showInvalidRoom}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' } as any}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={`Sorry, ${latestShowInvalidRoom.toUpperCase()} is not a valid room code.`}
        $css={{
          '.MuiSnackbarContent-root': {
            background: red['800'],
            color: 'white',
            fontSize: '0.6rem',
            padding: '0.1rem 1rem',
          },
        }}
      />
    </$.div>
  );
}
