import { ErrorCode } from "./errorCodes";

/**
 * Custom Error class
 */
export class ErrorExt extends Error {
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
