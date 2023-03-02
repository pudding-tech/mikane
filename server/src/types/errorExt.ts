/**
 * Custom Error class
 */
export class ErrorExt extends Error {
  /**
   * @param message Error message
   * @param code Error code, defaults to 500 if not provided
   */
  constructor(message: string, code = 500) {
    super(message);
    this.code = code;
  }
  code: number;
}
