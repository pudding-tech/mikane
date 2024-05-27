const usernameRegex = /^(?![_-])[a-zA-Z0-9]+(?:[_-]?[a-zA-Z0-9]+)*(?![_-])$/;

/**
 * Username must match URL-safe characters: alphanumeric, dashes, and underscores,
 * with a minimum length of 3 characters, a maximum length of 40 characters,
 * and disallowing hyphens or underscores at the start or end
 * @param username 
 */
export const isValidUsername = (username: string) => {
  if (!usernameRegex.test(username)) {
    return false;
  }

  if (username.length < 3 || username.length > 40) {
    return false;
  }

  return true;
};
