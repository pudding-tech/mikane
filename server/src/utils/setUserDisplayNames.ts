import { User } from "../types/types";

/**
 * Set a user's display name as the first and last names combined in cases where first name is shared with another user
 * @param users List of users
 */
export const setUserUniqueNames = (users: User[] | { id: number, name: string, [key: string]: any }[]) => {
  for (const user of users) {
    const sameFirstName = users.some(otherUser => {
      return otherUser.firstName === user.firstName && otherUser.id !== user.id;
    });
    if (sameFirstName) {
      user.name = user.firstName + " " + user.lastName;
    }
  }
};
