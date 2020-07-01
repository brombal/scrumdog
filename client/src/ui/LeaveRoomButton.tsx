import { faSignOut } from "@fortawesome/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ButtonBase, Tooltip } from "@material-ui/core";
import React from "react";

import { leaveRoom } from "@client/scrum";
import $ from "stylix";
import { StylixProps } from "stylix";

type LeaveRoomButtonProps = {};

export default function LeaveRoomButton({ ...other }: LeaveRoomButtonProps & StylixProps) {
  return (
    <Tooltip title="Leave room" arrow placement="left">
      <$.div {...other}>
        <$ $selector="&:hover" background="rgba(255, 255, 255, 0.2)">
          <$
            cursor="pointer"
            data-label="LeaveRoomButton"
            $el={ButtonBase}
            onClick={leaveRoom}
            width={60}
            height={60}
            border-radius={30}
            transition="background 100ms linear"
            display="block"
          >
            <div>
              <$ $el={FontAwesomeIcon} font-size={30} color="#FFF" icon={faSignOut} />
            </div>
          </$>
        </$>
      </$.div>
    </Tooltip>
  );
}
