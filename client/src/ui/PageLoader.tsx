import { CircularProgress } from "@material-ui/core";
import React from "react";

import { ZoomAnimate } from "@client/util/animations";
import $, { StylixProps } from "stylix";

interface PageLoaderProps {
  label: string;
}

export default function PageLoader({ label, ...other }: PageLoaderProps & StylixProps) {
  return (
    <ZoomAnimate
      display="flex"
      flex-direction="column"
      align-items="center"
      justify-content="center"
      pointer-events="none"
      font-size={22}
      data-label={`PageLoader:${label}`}
      {...other}
    >
      <CircularProgress color="inherit" />
      <$.div margin-top={20}>{label}</$.div>
    </ZoomAnimate>
  );
}
