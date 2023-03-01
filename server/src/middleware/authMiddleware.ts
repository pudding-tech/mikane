import { Request, Response, NextFunction } from "express";
import { PUD001 } from "../types/errorCodes";

/**
 * Only allow authenticated users to progress
 * @param req Request object
 * @param res Response object
 * @param next NextFunction
 */
export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.authenticated) {
    res.set("WWW-Authenticate", "Session");
    res.status(401).json(PUD001);
    return;
  }
  next();
};
