import "../global";

import React from "react";
import ReactDOM from "react-dom";
import { hot } from "react-hot-loader/root";

import App from "./App";

declare global {
  interface Window {
    socket: SocketIOClient.Socket;
  }
}

const HotApp = hot(App);

ReactDOM.render(
  // <React.StrictMode>
  <HotApp />,
  // </React.StrictMode>,
  document.getElementById("root")
);
