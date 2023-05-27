import "express-session";

declare module "express-session" {
  export interface SessionData {
    authenticated: boolean;
    userId: number;
    uuid: string;
    username: string;
  }
  export interface Store {
    destroyExpired(): void;
    destroyAll(userId: number, callback?: ((err?: any) => void)): void;
  }
}
