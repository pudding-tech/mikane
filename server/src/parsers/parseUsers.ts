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
      eventInfo: withEventData && userObj.event_uuid && userObj.event_joined_time ? {
        id: userObj.event_uuid,
        isAdmin: userObj.event_admin ?? false,
        joinedTime: userObj.event_joined_time
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

  // Sort users by time joined event
  users.sort((a, b) => {
    if (!a.eventInfo?.joinedTime || !b.eventInfo?.joinedTime) {
      return 0;
    }
    return a.eventInfo?.joinedTime.getTime() - b.eventInfo?.joinedTime.getTime();
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
  };
};
