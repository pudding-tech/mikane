import { ErrorCode } from "./errorCodes";

/**
 * Custom Error class
 */
export class ErrorExt extends Error {
  /**
   * @param error ErrorCode object or error message string
   * @param status Error status, defaults to 500 if not provided
   */
  constructor(error: ErrorCode | string, status = 500) {
    if (typeof(error) === "string") {
      super(error);
    }
    else {
      super(error.message);
      this.errorCode = error;
    }
    this.status = status;
  }
  status: number;
  errorCode?: ErrorCode;
}
