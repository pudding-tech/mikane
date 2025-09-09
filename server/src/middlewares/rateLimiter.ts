
import { NextFunction, Request, RequestHandler, Response } from "express";
import { rateLimit } from "express-rate-limit";
import { PUD149 } from "../types/errorCodes.ts";
import env from "../env.ts";

export const RATE_LIMIT_WINDOW_SEC = env.RATE_LIMIT_WINDOW_SEC ? env.RATE_LIMIT_WINDOW_SEC : 300;
export const RATE_LIMIT_MAX_REQUESTS = env.RATE_LIMIT_MAX_REQUESTS ?? 200;
export const RATE_LIMIT_STRICT_WINDOW_SEC = env.RATE_LIMIT_STRICT_WINDOW_SEC ? env.RATE_LIMIT_STRICT_WINDOW_SEC : 60;
export const RATE_LIMIT_STRICT_MAX_REQUESTS = env.RATE_LIMIT_STRICT_MAX_REQUESTS ?? 10;

const rateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_SEC * 1000,
  limit: RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res, _next) => {
    res.status(PUD149.status).json({ code: PUD149.code, message: PUD149.message });
  }
});

const rateLimiterStrict = rateLimit({
  windowMs: RATE_LIMIT_STRICT_WINDOW_SEC * 1000,
  limit: RATE_LIMIT_STRICT_MAX_REQUESTS,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res, _next) => {
    res.status(PUD149.status).json({ code: PUD149.code, message: PUD149.message });
  }
});

export const useRateLimit = (type: "standard" | "strict" = "standard"): RequestHandler => {
  return env.NODE_ENV !== "test"
    ? (type === "strict" ? rateLimiterStrict : rateLimiter)
    : (_req: Request, _res: Response, next: NextFunction) => next();
};
