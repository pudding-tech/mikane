import { NextFunction, Request, Response } from "express";
import { PUD150 } from "../types/errorCodes.ts";
import env from "../env.ts";

export const RATE_LIMIT_SINGLE_WINDOW_SEC = env.RATE_LIMIT_SINGLE_WINDOW_SEC ? env.RATE_LIMIT_SINGLE_WINDOW_SEC : 300;
const windowMs = RATE_LIMIT_SINGLE_WINDOW_SEC * 1000;

const requestStore: Record<string, Record<string, number>> = {};

export const singleRequestLimiter = (req: Request, res: Response, next: NextFunction) => {
  if (env.NODE_ENV === "test") {
    return next();
  }

  cleanupExpired();

  const ip = req.ip ?? "unknown";
  const endpoint = req.originalUrl;
  const now = Date.now();

  if (!requestStore[ip]) {
    requestStore[ip] = {};
  }

  const lastTime = requestStore[ip][endpoint];

  if (lastTime && (now - lastTime) < windowMs) {
    const secondsLeft = Math.ceil((windowMs - (now - lastTime)) / 1000);

    res.setHeader("Retry-After", secondsLeft);
    res.status(PUD150.status).json({ code: PUD150.code, message: PUD150.message });
    return;
  }

  requestStore[ip][endpoint] = now;
  next();
};

const cleanupExpired = () => {
  const now = Date.now();
  for (const ip in requestStore) {
    for (const endpoint in requestStore[ip]) {
      if ((now - requestStore[ip][endpoint]) > windowMs) {
        delete requestStore[ip][endpoint];
      }
    }
    if (Object.keys(requestStore[ip]).length === 0) {
      delete requestStore[ip];
    }
  }
};
