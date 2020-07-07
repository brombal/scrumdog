import "../global";

import React from "react";
import ReactDOM from "react-dom";
import { hot } from "react-hot-loader/root";

// This ensures that all static assets are served from the same directory url as the current script.
__webpack_public_path__ = document.scripts[document.scripts.length - 1].src.split("/").slice(0, -1).join("/") + "/";

import App from "./App";

const HotApp = hot(App);

ReactDOM.render(
  // <React.StrictMode>
  <HotApp />,
  // </React.StrictMode>,
  document.getElementById("root")
);
