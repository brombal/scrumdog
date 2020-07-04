import { faLink } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import $, { StylixProps, StylixTheme } from "stylix";

import CopyTooltip from "@client/ui/CopyTooltip";
import UserNameInput from "@client/ui/UserNameInput";
import { SlideAnimate } from "@client/util/animations";

type RoomHeaderProps = {
  roomCode: string;
  roomUrl: string;
};

export default function RoomHeader({ roomUrl, roomCode, ...other }: RoomHeaderProps & StylixProps) {
  return (
    <StylixTheme media={["(max-width: 1200px)"]}>
      <SlideAnimate distance={-80} {...other}>
        <$.div
          display="flex"
          align-items={["center", "flex-end"]}
          flex-direction={["column", "row"]}
          font-size={["1.5rem", "1rem"]}
        >
          <CopyTooltip title="Copy link" url={roomUrl}>
            <$.div
              display="flex"
              margin-right={[0, "2em"]}
              margin-bottom={["0.5em", 0]}
              padding-bottom={10}
              $css={{ "&:hover .icon": { transform: "scale(1.1)" } }}
            >
              <$
                $el={FontAwesomeIcon}
                icon={faLink}
                margin-top="1.25em"
                margin-right="0.3em"
                font-size="0.65em"
                className="icon"
                transition="transform 200ms ease-out"
              />
              <$.div text-align="center">
                <$.div font-size="0.5em">room code</$.div>
                <$.div font-size="1em" font-weight={600} line-height={0.8}>
                  {roomCode}
                </$.div>
              </$.div>
            </$.div>
          </CopyTooltip>
          <UserNameInput padding-bottom={10} />
        </$.div>
      </SlideAnimate>
    </StylixTheme>
  );
}
