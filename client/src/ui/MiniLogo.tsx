import React from "react";

import $ from "@stylix/core";
import { StylixProps } from "@stylix/core";

type MiniLogoProps = {};

export default function MiniLogo({ ...other }: MiniLogoProps & StylixProps) {
  return (
    <$.div data-label="MiniLogo" display="flex" align-items="center" {...other}>
      <$.img src={require("./ajax-white.png").default} width={35} />
      <$.img src={require("./logo.png").default} width={180} margin-left={20} />
    </$.div>
  );
}
