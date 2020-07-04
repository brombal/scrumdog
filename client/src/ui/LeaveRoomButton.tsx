import { faSignOut } from "@fortawesome/pro-light-svg-icons";
import React from "react";
import { StylixProps } from "stylix";

import { leaveRoom } from "@client/scrum";
import { IconButton } from "@client/ui/Button";

type LeaveRoomButtonProps = {};

export default function LeaveRoomButton({ ...other }: LeaveRoomButtonProps & StylixProps) {
  return (
    <IconButton
      icon={faSignOut}
      tooltip="Leave room"
      tooltipProps={{ placement: "left" }}
      data-label="LeaveRoomButton"
      onClick={leaveRoom}
      font-size="0.8rem"
      {...other}
    />
  );
}
