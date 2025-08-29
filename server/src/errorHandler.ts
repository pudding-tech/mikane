import { NextFunction, Request, Response } from "express";
import { ErrorExt } from "./types/errorExt.ts";
import { PUD148 } from "./types/errorCodes.ts";
import logger from "./utils/logger.ts";

export const errorHandler = (err: ErrorExt | Error, _req: Request, res: Response, next: NextFunction) => {
  if (!err) {
    next();
  }
  else if ((err as { code: string })?.code === "EBADCSRFTOKEN") {
    logger.warn(err);
    res.status(PUD148.status).json({ code: PUD148.code, message: PUD148.message });
  }
  else if (err instanceof ErrorExt) {
    if (err.log) {
      logger.error(err.error || err);
    }
    res.status(err.status).json({
      code: err.code,
      message: err.message
    });
  }
  else {
    logger.error(err);
    res.status(500).json({ error: "Something broke :(" });
  }
};
