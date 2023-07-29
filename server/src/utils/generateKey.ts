import { randomBytes } from "crypto";

/**
 * Generate a random key
 * @returns Random key
 */
export const generateKey = () => {
  return randomBytes(48).toString("hex");
};
