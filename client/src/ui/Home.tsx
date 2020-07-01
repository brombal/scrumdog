import React from "react";

import { createRoom } from "@client/scrum";
import Button from "@client/ui/Button";
import { ZoomAnimate } from "@client/util/animations";
import $, { StylixProps } from "stylix";

type HomeProps = {};

export default function Home({ ...other }: HomeProps & StylixProps) {
  return (
    <$.div
      display="flex"
      flex-direction="column"
      align-items="center"
      justify-content="center"
      position="relative"
      padding="30px 15px"
      {...other}
    >
      <$.div display="flex" flex-direction="column" align-items="center" justify-content="center">
        <ZoomAnimate flex="0 0 auto" display="flex" flex-direction="column" align-items="center">
          <$.img src={require("./ajax-white.png").default} max-height="25vh" margin-bottom={10} />
          <$.img src={require("./logo.png").default} max-width="80vw" max-height="15vh" margin-bottom={10} />
          <$.div font-size="24px" opacity={0.75}>
            interactive planning poker
          </$.div>
          <$.div flex="0 1 auto" height="10vh" />
        </ZoomAnimate>
        <ZoomAnimate flex="0 0 auto" display="flex" flex-wrap="wrap">
          <Button margin="10px" flex="1 1 auto" onClick={createRoom}>
            CREATE ROOM
          </Button>
          <Button filled margin="10px" flex="1 1 auto">
            JOIN ROOM
          </Button>
        </ZoomAnimate>
      </$.div>
    </$.div>
  );
}
