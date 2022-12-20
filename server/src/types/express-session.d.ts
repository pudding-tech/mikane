import session from "express-session";

declare module "express-session" {
  export interface SessionData {
    authenticated: boolean,
    userId: number,
    username: string
  }
}
