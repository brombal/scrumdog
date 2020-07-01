declare module "scrumdog" {
  global {
    interface Window {
      env: any;
    }
  }
}

declare module "mongodb" {
  export type ObjectId = string;
}
