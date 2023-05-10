import { scryptSync, randomBytes } from "crypto";

/**
 * Generate a random API key
 * @returns API key
 */
export const generateApiKey = () => {
  return randomBytes(16).toString("hex");
};

/**
 * Compare given password with hashed password
 * @param password Given password
 * @param hash Hashed password with salt included
 * @returns Whether authentification is successful or not
 */
export const authenticate = (password: string, hash: string) => {
  const originalHash = hash.slice(0, 64);
  const salt = hash.slice(64);
  const newHash = hashPassword(password, salt);

  return newHash === originalHash;
};

/**
 * Return hash and salt combined from a given password
 * @param password 
 * @returns Hash with salt appended
 */
export const createHash = (password: string) => {
  const salt = randomBytes(16).toString("hex");
  const hash = hashPassword(password, salt);
  return hash + salt;
};

/**
 * Hash password with the given salt
 * @param password 
 * @param salt 
 * @returns Hashed password
 */
const hashPassword = (password: string, salt: string) => {
  return scryptSync(password, salt, 32).toString("hex");
};
