import { faSignOut } from "@fortawesome/pro-light-svg-icons";
import { faLink } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import $, { StylixProps } from "stylix";

import { getRoomUrl, leaveRoom, store } from "@client/scrum";
import { IconButton } from "@client/ui/Button";
import CopyTooltip from "@client/ui/CopyTooltip";
import { flexCentered } from "@client/ui/styles";

type LeaveRoomButtonProps = { roomCode: string };

export default function LeaveRoomButton({ roomCode, ...other }: LeaveRoomButtonProps & StylixProps) {
  const [isHost, hostName] = store.useState((s) => [s.me?.host, s.users?.find((u) => u.host)?.name]);

  const roomUrl = getRoomUrl(roomCode);

  return (
    <$.div display="flex" {...other} font-size="1rem">
      <CopyTooltip title="Copy link" url={roomUrl} placement="left">
        <$.div
          {...flexCentered}
          flex-direction="column"
          margin-right="0.5em"
          $css={{ "&:hover .icon": { transform: "scale(1.1)" } }}
        >
          <$.div font-size="0.5em">{!isHost ? `${hostName}'s room` : "room code"}</$.div>
          <$.div {...flexCentered}>
            <$
              $el={FontAwesomeIcon}
              icon={faLink}
              margin-top="0.05em"
              margin-right="0.3em"
              font-size="0.65em"
              className="icon"
              transition="transform 200ms ease-out"
            />
            <$.div font-size="1em" font-weight={600} line-height={0.8}>
              {roomCode}
            </$.div>
          </$.div>
        </$.div>
      </CopyTooltip>
      <IconButton
        icon={faSignOut}
        tooltip="Leave room"
        tooltipProps={{ placement: "left" }}
        data-label="LeaveRoomButton"
        onClick={leaveRoom}
        font-size="0.8em"
        {...other}
      />
    </$.div>
  );
}
