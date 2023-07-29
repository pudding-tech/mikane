import "express-session";

declare module "express-session" {
  export interface SessionData {
    authenticated: boolean;
    userId: string;
    username: string;
    avatarURL: string;
  }
  export interface Store {
    destroyExpired(): void;
    destroyAll(userId: string, callback?: ((err?: any) => void)): void;
  }
}
