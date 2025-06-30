import { ErrorExt } from "../types/errorExt.ts";
import { PUD141 } from "../types/errorCodes.ts";

/**
 * Creates a Date. Throws error if invalid date
 * @param dateInput 
 * @returns Date
 */
export const createDate = (dateInput: string) => {
  if (!dateInput) {
    throw new ErrorExt(PUD141);
  }

  const date = new Date(dateInput);

  if (isNaN(date.getTime())) {
    throw new ErrorExt(PUD141);
  }

  return date;
};
