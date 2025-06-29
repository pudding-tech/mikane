import { NextFunction, Request, Response } from "express";
import { ErrorExt } from "./types/errorExt";

export const errorHandler = (err: ErrorExt | Error, _req: Request, res: Response, next: NextFunction) => {
  if (!err) {
    next();
  }
  if (err instanceof ErrorExt) {
    if (err.log) {
      console.error(err.error || err);
    }
    res.status(err.status).json({
      code: err.code,
      message: err.message
    });
  }
  else {
    console.error(err);
    res.status(500).json({ error: "Something broke :(" });
  }
};
