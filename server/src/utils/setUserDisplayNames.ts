import { User } from "../types/types";

/**
 * Set a user's display name as the first and last names combined in cases where first name is shared with another user
 * @param users List of users
 */
export const setUserUniqueNames = (users: User[]) => {
  for (const user of users) {
    const sameName = users.some(otherUser => {
      return otherUser.firstName === user.firstName && otherUser.id !== user.id;
    });
    if (sameName) {
      user.name = user.firstName + " " + user.lastName;
    }
  }
};
