declare module "scrumdog" {
  global {
    interface Window {
      env: any;
      socket: SocketIOClient.Socket;
    }
  }
}

declare module "mongodb" {
  export type ObjectId = string;
}

declare let __webpack_public_path__: string;
