import { Request, Response, NextFunction } from "express";
import { ErrorCode, PUD001, PUD065, PUD066, PUD067, PUD069 } from "../types/errorCodes";
import { getApiKeys } from "../db/dbAuthentication";
import { authenticate } from "../utils/auth";
import { APIKey } from "../types/types";
import { ErrorExt } from "../types/errorExt";

/**
 * Only allow authenticated users to progress
 * @param req Request object
 * @param res Response object
 * @param next NextFunction
 */
export const authCheck = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.session.authenticated) {
      throw new ErrorExt(PUD001);
    }
    next();
  }
  catch (err) {
    next(err);
  }
};

type KeyOutput = {
  valid: boolean,
  reason?: ErrorCode
};

/**
 * Only allow authenticated users or requests with a correct API key to progress
 * @param req Request object
 * @param res Response object
 * @param next NextFunction
 */
export const authKeyCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.session.authenticated) {
      return next();
    }

    const authKey = req.get("Authorization");
    if (!authKey) {
      throw new ErrorExt(PUD065);
    }

    const keys = await getApiKeys("all");
    const isAuthenticated: KeyOutput = checkKeys(authKey, keys);

    if (!isAuthenticated.valid && isAuthenticated.reason) {
      throw new ErrorExt(isAuthenticated.reason);
    }

    req.authIsApiKey = true;
    next();
  }
  catch (err) {
    next(err);
  }
};

/**
 * Only allow requests with a correct master API key to progress
 * @param req Request object
 * @param res Response object
 * @param next NextFunction
 */
export const masterKeyCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authKey = req.get("Authorization");
    if (!authKey) {
      throw new ErrorExt(PUD069);
    }

    const keys = await getApiKeys("master");
    const isAuthenticated: KeyOutput = checkKeys(authKey, keys);

    if (!isAuthenticated.valid && isAuthenticated.reason) {
      throw new ErrorExt(isAuthenticated.reason);
    }

    req.authIsApiKey = true;
    next();
  }
  catch (err) {
    next(err);
  }
};

/**
 * Check for valid keys
 * @param authKey Key provided by user
 * @param keys Keys provided by database
 * @returns Object with valid and reason properties
 */
const checkKeys = (authKey: string, keys: APIKey[]): KeyOutput => {
  for (const key of keys) {
    const match = authenticate(authKey, key.hashedKey);
    if (!match) {
      continue;
    }

    // Check for valid time range
    const now = new Date();
    const offset = now.getTimezoneOffset();
    now.setMinutes(now.getMinutes() - offset);
    if (key.validFrom && key.validFrom.getTime() > now.getTime()) {
      return { valid: false, reason: PUD067 };
    }
    if (key.validTo && key.validTo.getTime() < now.getTime()) {
      return { valid: false, reason: PUD067 };
    }
    return { valid: true };
  }  
  return { valid: false, reason: PUD066 };
};
