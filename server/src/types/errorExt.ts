import { ErrorCode } from "./errorCodes";

/**
 * Custom Error class
 */
export class ErrorExt extends Error {
  /**
   * @param error ErrorCode object or error message string
   * @param code Error code, defaults to 500 if not provided
   */
  constructor(error: ErrorCode | string, code = 500) {
    if (typeof(error) === "string") {
      super(error);
    }
    else {
      super(error.message);
      this.errorCode = {
        code: error.code,
        message: error.message
      };
    }
    this.code = code;
  }
  code: number;
  errorCode?: ErrorCode;
}
