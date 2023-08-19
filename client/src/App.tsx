import { StylixProvider, StylixTheme } from "@stylix/core";
import React from "react";

import ScrumdogApp from "client/ui/ScrumdogApp";
import { stylixTheme } from "client/ui/theme";

export default function App() {
  return (
    <StylixProvider id="main">
      <StylixTheme theme={stylixTheme} media={["(max-width: 768px)"]}>
        <ScrumdogApp height="100vh" width="100vw" />
      </StylixTheme>
    </StylixProvider>
  );
}
