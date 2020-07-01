import Ambient from "./ambient";

declare global {
  interface Window {
    Ambient: any;
  }
}

window.Ambient = Ambient;
