
import { NextFunction, Request, RequestHandler, Response } from "express";
import { rateLimit } from "express-rate-limit";
import { PUD149 } from "../types/errorCodes.ts";
import env from "../env.ts";

const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_SEC ? env.RATE_LIMIT_WINDOW_SEC * 1000 : 300000,
  limit: env.RATE_LIMIT_MAX_REQUESTS ?? 200,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res, _next) => {
    res.status(PUD149.status).json({ code: PUD149.code, message: PUD149.message });
  }
});

const rateLimiterStrict = rateLimit({
  windowMs: env.RATE_LIMIT_STRICT_WINDOW_SEC ? env.RATE_LIMIT_STRICT_WINDOW_SEC * 1000 : 60000,
  limit: env.RATE_LIMIT_STRICT_MAX_REQUESTS ?? 10,
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
