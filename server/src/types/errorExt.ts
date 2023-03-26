import { ErrorCode } from "./errorCodes";

/**
 * Custom Error class
 */
export class ErrorExt extends Error {
  /**
   * @param errorCode ErrorCode object
   * @param error Original error
   * @param status Error status, defaults to 500 if not provided
   */
  constructor(errorCode: ErrorCode, error?: Error, status = 500) {
    super(errorCode.message);
    this.code = errorCode.code;
    this.message = errorCode.message;
    this.log = errorCode.log;
    this.error = error;
    this.status = status;
  }
  code: string;
  message: string;
  log?: boolean;
  error?: Error;
  status: number;
}
