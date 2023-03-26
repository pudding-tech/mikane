import { NextFunction, Request, Response } from "express";
import { ErrorExt } from "./types/errorExt";

export const errorHandler = (err: ErrorExt | Error, req: Request, res: Response, next: NextFunction) => {
  if (!err) {
    return next();
  }
  if (err instanceof ErrorExt) {
    if (err.log) {
      console.log(err.error || err);
    }
    return res.status(err.status).json({
      code: err.code,
      message: err.message
    });
  }
  else {
    console.log(err);
    return res.status(500).json({ error: "Something broke :(" });
  }
};
