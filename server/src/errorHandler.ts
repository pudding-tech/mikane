import { NextFunction, Request, Response } from "express";
import { ErrorExt } from "./types/errorExt";

export const errorHandler = (err: ErrorExt | Error, req: Request, res: Response, next: NextFunction) => {
  if (!err) {
    return next();
  }
  if (err instanceof ErrorExt) {
    if (err.errorCode) {
      return res.status(err.status).json(err.errorCode);
    }
    console.log(err);
    return res.status(err.status).json({ error: err.message ? err.message : "Something broke :(" });
  }
  else {
    console.log(err);
    return res.status(500).json({ error: "Something broke :(" });
  }
};
