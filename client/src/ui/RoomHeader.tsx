import React from "react";
import { StylixProps } from "stylix";

import UserNameInput from "@client/ui/UserNameInput";
import { SlideAnimate } from "@client/util/animations";

type RoomHeaderProps = {};

export default function RoomHeader({ ...other }: RoomHeaderProps & StylixProps) {
  return (
    <SlideAnimate distance={-80} {...other}>
      <UserNameInput padding-bottom={10} font-size="1rem" />
    </SlideAnimate>
  );
}
