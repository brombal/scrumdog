import { jssPreset, StylesProvider, ThemeProvider } from "@material-ui/core";
import { create } from "jss";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { StylixProvider, StylixTheme } from "stylix";

import ScrumdogApp from "@client/ui/ScrumdogApp";
import { materialTheme, stylixTheme } from "@client/ui/theme";

const jss = create({
  ...jssPreset(),
  insertionPoint: "jss-insertion-point",
});

export default function App() {
  return (
    <BrowserRouter>
      <StylixProvider id="main">
        <StylixTheme theme={stylixTheme} media={["(max-width: 768px)"]}>
          <ThemeProvider theme={materialTheme}>
            <StylesProvider jss={jss}>
              <ScrumdogApp height="100vh" width="100vw" />
            </StylesProvider>
          </ThemeProvider>
        </StylixTheme>
      </StylixProvider>
    </BrowserRouter>
  );
}
