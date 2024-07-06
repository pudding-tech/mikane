/**
 * Validate a password. Passwords need to be at least 3 characters long.
 * @param password
 */
export const isValidPassword = (password: string) => {
  if (!password || password.trim().length < 3) {
    return false;
  }

  return true;
};
