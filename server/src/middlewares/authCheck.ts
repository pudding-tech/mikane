import { Request, Response, NextFunction } from "express";
import { ErrorCode, PUD001, PUD065, PUD066, PUD067, PUD069 } from "../types/errorCodes";
import { getApiKeys } from "../db/dbAuthentication";
import { authenticate } from "../utils/auth";
import { APIKey } from "../types/types";

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
  if (req.session.authenticated) {
    return next();
  }

  const authKey = req.get("Authorization");
  if (!authKey) {
    return res.status(401).json(PUD065);
  }

  try {
    const keys = await getApiKeys("all");
    const isAuthenticated: KeyOutput = checkKeys(authKey, keys);

    if (!isAuthenticated.valid) {
      return res.status(401).json(isAuthenticated.reason);
    }
  }
  catch (err) {
    next(err);
  }

  next();
};

/**
 * Only allow requests with a correct master API key to progress
 * @param req Request object
 * @param res Response object
 * @param next NextFunction
 */
export const masterKeyCheck = async (req: Request, res: Response, next: NextFunction) => {
  const authKey = req.get("Authorization");
  if (!authKey) {
    return res.status(401).json(PUD069);
  }

  try {
    const keys = await getApiKeys("master");
    const isAuthenticated: KeyOutput = checkKeys(authKey, keys);

    if (!isAuthenticated.valid) {
      return res.status(401).json(isAuthenticated.reason);
    }
  }
  catch (err) {
    next(err);
  }

  next();
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
