import { CircularProgress } from "@material-ui/core";
import React from "react";
import $, { StylixProps } from "stylix";

import { flexCentered } from "@client/ui/styles";
import { ZoomAnimate } from "@client/util/animations";

interface PageLoaderProps {
  label: string;
}

export default function PageLoader({ label, ...other }: PageLoaderProps & StylixProps) {
  return (
    <ZoomAnimate
      {...flexCentered}
      flex-direction="column"
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
