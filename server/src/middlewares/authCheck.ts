import { Request, Response, NextFunction } from "express";
import { PUD001, PUD065, PUD066, PUD067 } from "../types/errorCodes";
import { getApiKeys } from "../db/dbAuthentication";
import { authenticate } from "../utils/auth";

/**
 * Only allow authenticated users to progress
 * @param req Request object
 * @param res Response object
 * @param next NextFunction
 */
export const authCheck = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.authenticated) {
    res.set("WWW-Authenticate", "Session");
    res.status(401).json(PUD001);
    return;
  }
  next();
};

/**
 * Only allow authenticated users or requests with a correct API key to progress
 * @param req Request object
 * @param res Response object
 * @param next NextFunction
 */
export const authKeyCheck = async (req: Request, res: Response, next: NextFunction) => {
  if (req.session.authenticated) {
    return next();
  }

  const authKey = req.get("Authorization");
  if (!authKey) {
    return res.status(401).json(PUD065);
  }

  try {
    const keys = await getApiKeys();

    let isAuthenticated = false;
    for (const key of keys) {
      const correct = authenticate(authKey, key.hashedKey);
      if (!correct) {
        continue;
      }

      // Check for valid dates
      const now = new Date();
      const offset = now.getTimezoneOffset();
      now.setMinutes(now.getMinutes() - offset);
      if (key.validFrom && key.validFrom.getTime() > now.getTime()) {
        return res.status(401).json(PUD067);
      }
      if (key.validTo && key.validTo.getTime() < now.getTime()) {
        return res.status(401).json(PUD067);
      }

      isAuthenticated = true;
      break;
    }
    if (!isAuthenticated) {
      return res.status(401).json(PUD066);
    }
  }
  catch (err) {
    next(err);
  }

  next();
};
