import { PudError } from "../types/errors.ts";
import { PUD141 } from "../types/errorCodes.ts";

/**
 * Creates a Date. Throws error if invalid date
 * @param dateInput 
 * @returns Date
 */
export const createDate = (dateInput: string) => {
  if (!dateInput) {
    throw new PudError(PUD141);
  }

  const date = new Date(dateInput);

  if (isNaN(date.getTime())) {
    throw new PudError(PUD141);
  }

  return date;
};
