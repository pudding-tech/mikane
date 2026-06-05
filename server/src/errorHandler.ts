import { NextFunction, Request, Response } from "express";
import { CurrencyExchangeServiceError, PudError } from "./types/errors.ts";
import { PUD148, PUD155 } from "./types/errorCodes.ts";
import logger from "./utils/logger.ts";

type CsrfError = {
  code?: string;
};

/**
 * Handle CSRF validation errors from csrf-sync.
 * @param err The error thrown by csrf-sync, expected to have a code property "EBADCSRFTOKEN" for CSRF errors.
 * @param _req The Express request object.
 * @param res The Express response object.
 * @param next The next middleware function in the chain.
 * @returns 
 */
export const csrfErrorHandler = (err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (typeof err === "object" && err !== null && (err as CsrfError).code === "EBADCSRFTOKEN") {
    logger.warn(err);
    res.status(PUD148.status).json({ code: PUD148.code, message: PUD148.message });
    return;
  }
  next(err);
};

/**
 * Handle application errors represented by PudError.
 * @param err The error thrown by the application, expected to be an instance of PudError.
 * @param _req The Express request object.
 * @param res The Express response object.
 * @param next The next middleware function in the chain.
 * @returns 
 */
export const pudErrorHandler = (err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (!(err instanceof PudError)) {
    next(err);
    return;
  }

  if (err.log) {
    logger.error(err.error ?? err);
  }

  res.status(err.status).json({
    code: err.code,
    message: err.message
  });
};

/**
 * Handle currency exchange provider errors.
 * @param err The error thrown by the currency exchange service, expected to be an instance of CurrencyExchangeServiceError.
 * @param _req The Express request object.
 * @param res The Express response object.
 * @param next The next middleware function in the chain.
 * @returns 
 */
export const currencyExchangeErrorHandler = (err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (!(err instanceof CurrencyExchangeServiceError)) {
    next(err);
    return;
  }

  logger.error(err);

  res.status(PUD155.status).json({
    code: PUD155.code,
    message: PUD155.message
  });
};

/**
 * Final fallback error handler, returns a generic 500 response.
 * @param err The error that was not handled by previous error handlers.
 * @param _req The Express request object.
 * @param res The Express response object.
 * @param _next The next middleware function in the chain.
 */
export const fallbackErrorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err);
  res.status(500).json({ error: "Something broke :(" });
};
