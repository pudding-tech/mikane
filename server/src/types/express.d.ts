import "express";
import type { RateLimitInfo } from "express-rate-limit";

declare module "express-serve-static-core" {
  export interface Request {
    authIsApiKey?: boolean;
    rateLimit?: RateLimitInfo;
  }
}
