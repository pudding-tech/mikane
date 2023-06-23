import { setUserUniqueNames } from "../utils/setUserDisplayNames";
import { User } from "../types/types";
import { UserDB } from "../types/typesDB";

/**
 * Build array of User objects
 * @param usersInput List of UserDB objects
 * @param withEventData Whether to include user-event data (if present)
 * @returns List of User objects
 */
export const parseUsers = (usersInput: UserDB[], withEventData: boolean): User[] => {
  const users: User[] = [];
  usersInput.forEach(userObj => {
    const user: User = {
      id: userObj.id,
      username: userObj.username,
      name: userObj.first_name,
      firstName: userObj.first_name,
      lastName: userObj.last_name,
      email: userObj.email,
      created: userObj.created,
      uuid: userObj.uuid,
      event: withEventData && userObj.event_id && userObj.event_joined_date ? {
        id: userObj.event_id,
        isAdmin: userObj.event_admin ?? false,
        joinedDate: userObj.event_joined_date
      } : undefined
    };
    users.push(user);
  });

  // Set unique names of users where they are shared
  setUserUniqueNames(users);
  for (const user of users) {
    delete user.firstName;
    delete user.lastName;
  }

  // Sort users by date joined event
  users.sort((a, b) => {
    if (!a.event?.joinedDate || !b.event?.joinedDate) {
      return 0;
    }
    return a.event?.joinedDate.getTime() - b.event?.joinedDate.getTime();
  });

  return users;
};

/**
 * Parse single User object
 * @param userObj UserDB object
 * @returns User object
 */
export const parseUser = (userObj: UserDB): User => {
  return {
    id: userObj.id,
    username: userObj.username,
    name: userObj.first_name,
    firstName: userObj.first_name,
    lastName: userObj.last_name,
    email: userObj.email,
    phone: userObj.phone_number,
    created: userObj.created,
    uuid: userObj.uuid
  };
};
