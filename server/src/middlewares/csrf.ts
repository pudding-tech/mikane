import { csrfSync } from "csrf-sync";
import { Request, Response, NextFunction } from "express";
import env from "../env.ts";
import logger from "../utils/logger.ts";

const getFromHeaders = (req: Request) => {
  return req.get("x-xsrf-token") ?? req.get("x-csrf-token");
};

const csrfSyncProtection = csrfSync({
  getTokenFromRequest: (req) => {
    if (req.is("application/x-www-form-urlencoded")) {
      return req.body?.CSRFToken ?? getFromHeaders(req);
    }
    return getFromHeaders(req);
  }
});

export const csrfCheck: (req: Request, res: Response, next: NextFunction) => void =
  env.SKIP_CSRF_CHECK
    ? (_req, _res, next) => { logger.debug("CSRF check skipped"); next(); }
    : csrfSyncProtection.csrfSynchronisedProtection;

export const generateCsrfToken = csrfSyncProtection.generateToken;
