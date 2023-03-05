import { NextFunction, Request, Response } from "express";
import { ErrorExt } from "./types/errorExt";

export const errorHandler = (err: ErrorExt | Error, req: Request, res: Response, next: NextFunction) => {
  if (!err) {
    return next();
  }
  if (err instanceof ErrorExt) {
    if (err.errorCode) {
      return res.status(err.code).json(err.errorCode);
    }
    console.log(err);
    return res.status(err.code).json({ error: err.message ? err.message : "Something broke :(" });
  }
  else {
    console.log(err);
    return res.status(500).json({ error: "Something broke :(" });
  }
};
