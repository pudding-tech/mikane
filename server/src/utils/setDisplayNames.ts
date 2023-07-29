import { User } from "../types/types";

type CategoryUser = {
  id: string,
  name: string,
  username?: string,
  firstName?: string,
  lastName?: string
};

/**
 * Set all users' display name as the first and last names combined in cases where first name is shared with another user.
 * If a second list of users is given, this list will be used to check for duplicates
 * @param users List of users
 * @param usersInEvent List of all users in event (optional)
 */
export const setDisplayNames = (users: User[] | CategoryUser[], usersInEvent?: User[]) => {
  for (const user of users) {
    const sameFirstName = (usersInEvent ?? users).some(otherUser => {
      return otherUser.firstName === user.firstName && otherUser.id !== user.id;
    });
    if (sameFirstName) {
      if (user.lastName) {
        user.name = user.firstName + " " + user.lastName;
      }
      else {
        user.name = user.firstName + " (" + user.username + ")";
      }
    }
  }
};
