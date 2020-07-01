import { TextField } from "@material-ui/core";
import React from "react";

import { store, updateUserName } from "../scrum";
import $ from "stylix";

export default function UserNameInput({ ...other }: any) {
  const name = store.useState((s) => s.me?.name);

  return (
    <$.div font-size="1rem" display="flex" align-items="baseline" justify-content="center" {...other}>
      <$.span flex="0 0 auto">hi,</$.span>
      <$
        $el={TextField}
        value={name}
        onChange={(e) => updateUserName(e.target.value)}
        placeholder="(your name)"
        margin-left="0.3em"
        width="8em"
      />
    </$.div>
  );
}
