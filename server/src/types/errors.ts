import { ErrorCode } from "./errorCodes.ts";

/**
 * Error class for PUD error codes
 */
export class PudError extends Error {
  /**
   * @param errorCode ErrorCode object
   * @param error Original error
   */
  constructor(errorCode: ErrorCode, error?: Error) {
    super(errorCode.message);
    this.code = errorCode.code;
    this.message = errorCode.message;
    this.log = errorCode.log;
    this.error = error;
    this.status = errorCode.status;
  }
  code: string;
  message: string;
  log?: boolean;
  error?: Error;
  status: number;
}

/**
 * Error class for currency exchange provider errors
 */
export class CurrencyExchangeServiceError extends Error {
  /**
   * @param message The error message
   * @param status The HTTP status code associated with the error, if applicable
   */
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "CurrencyExchangeServiceError";
  }
}
