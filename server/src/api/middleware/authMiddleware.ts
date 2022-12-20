import { Request, Response, NextFunction } from "express";

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  console.log(req.session);
  if (req.session.authenticated) {
    return next();
  }
  res.set("WWW-Authenticate", "Session");
  res.status(401).json({ err: "You are not authenticated" });
};
