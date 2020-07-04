import { faArrowCircleRight, faArrowLeft } from "@fortawesome/pro-light-svg-icons";
import { OutlinedInput, Slide, Snackbar } from "@material-ui/core";
import { red } from "@material-ui/core/colors";
import { AnimatePresence, motion } from "framer-motion";
import React, { useRef, useState } from "react";
import $, { StylixProps } from "stylix";

import { cancelPromptJoinRoom, createRoom, joinRoom, promptJoinRoom, store } from "@client/scrum";
import Button, { IconButton } from "@client/ui/Button";
import { absFullSize, flexCentered } from "@client/ui/styles";
import { ZoomAnimate } from "@client/util/animations";
import { useEvent, useEventEmitter } from "@client/util/useEvent";
import usePresenceTimer from "@client/util/usePresenceTimer";
import PageLoader from "@client/ui/PageLoader";
import useLatestValue from "@client/util/useLatestValue";

type HomeProps = {};

export default function Home({ ...other }: HomeProps & StylixProps) {
  const [error, state, roomCode] = store.useState((state) => [state.error, state.state, state.room?.code]);
  const [roomCodeInput, setRoomCodeInput] = useState(roomCode || "");
  const isPresent = usePresenceTimer(1000);

  const [showInvalidRoom, setShowInvalidRoom] = useState("");
  const latestShowInvalidRoom = useLatestValue(showInvalidRoom);

  const timeoutRef = useRef<any>();

  useEvent(
    "invalid-room",
    (code) => {
      setShowInvalidRoom(code);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setShowInvalidRoom(""), 5000);
      return () => clearTimeout(timeoutRef.current);
    },
    []
  );

  const emitter = useEventEmitter();

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
      <AnimatePresence>
        {isPresent &&
          (!error && (state === "creating-room" || state === "loading" || state === "joining-room") ? (
            <PageLoader
              key="PageLoader"
              label={state === "creating-room" ? "creating room..." : "loading..."}
              {...absFullSize}
            />
          ) : (
            <React.Fragment key="body">
              <ZoomAnimate key="logo" flex="0 0 auto" {...flexCentered} flex-direction="column" align-items="center">
                <$.img src={require("./ajax-white.png").default} height="25vh" margin-bottom={10} />
                <$.img src={require("./logo.png").default} max-width="80vw" height="15vh" margin-bottom={10} />
                <$.div font-size="24px" opacity={0.75}>
                  interactive planning poker
                </$.div>
                <$.div flex="0 1 auto" height="10vh" />
              </ZoomAnimate>
              <ZoomAnimate key="inputs" flex="0 0 3rem" position="relative">
                <AnimatePresence>
                  {!state && (
                    <ZoomAnimate key="buttons" {...absFullSize} {...flexCentered} flex-wrap="wrap">
                      <Button margin={10} flex="1 1 auto" onClick={createRoom}>
                        CREATE ROOM
                      </Button>
                      <Button filled margin={10} flex="1 1 auto" onClick={promptJoinRoom}>
                        JOIN ROOM
                      </Button>
                    </ZoomAnimate>
                  )}
                  {state === "prompt-join" && (
                    <ZoomAnimate key="prompt" {...absFullSize} {...flexCentered}>
                      <$.form
                        {...flexCentered}
                        onSubmit={(e) => {
                          joinRoom(roomCodeInput, emitter);
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
                          value={roomCodeInput || ""}
                          inputProps={{
                            onKeyDown: (e) => {
                              if (e.key === "Escape") cancelPromptJoinRoom();
                            },
                            maxLength: 4,
                          }}
                          autoFocus
                          onChange={(e) => setRoomCodeInput(e.target.value)}
                          placeholder="code"
                          $css={{
                            input: {
                              textAlign: "center",
                              textTransform: "uppercase",
                              fontWeight: 700,
                              width: "2.8em",
                              fontSize: "1.7em",
                              padding: "0.2em",
                            },
                            "input::placeholder": {
                              textTransform: "none",
                              fontSize: "0.8em",
                              transform: "translateY(-0.12em)",
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
                    </ZoomAnimate>
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
        TransitionProps={{ direction: "up" } as any}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        message={`Sorry, ${latestShowInvalidRoom.toUpperCase()} is not a valid room code.`}
        $css={{
          ".MuiSnackbarContent-root": {
            background: red["800"],
            color: "white",
            fontSize: "0.6rem",
            padding: "0.1rem 1rem",
          },
        }}
      />
    </$.div>
  );
}
