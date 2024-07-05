import { setDisplayNames } from "../utils/setDisplayNames";
import { getGravatarURL } from "../utils/gravatar";
import { Guest, User } from "../types/types";
import { UserDB } from "../types/typesDB";

/**
 * Build array of User objects
 * @param usersInput List of UserDB objects
 * @param withEventData Whether to include user-event data (if present)
 * @param excludeGuests Whether to exclude guest users
 * @param avatarSize Pixel size of user avatar
 * @returns List of User objects
 */
export const parseUsers = (usersInput: UserDB[], withEventData: boolean, excludeGuests: boolean, avatarSize?: number): User[] => {
  const users: User[] = [];
  const allUsers: User[] = [];

  usersInput.forEach(userObj => {
    if (userObj.deleted) {
      const user: User = {
        id: userObj.id,
        username: "Deleted user",
        name: "Deleted user",
        avatarURL: getGravatarURL("", { size: avatarSize ?? 200, default: "mp" }),
        guest: userObj.guest,
        superAdmin: userObj.super_admin
      };
      allUsers.push(user);
      if (!excludeGuests || (excludeGuests && !user.guest)) {
        users.push(user);
      }
      return;
    }

    const user: User = {
      id: userObj.id,
      username: userObj.username,
      name: userObj.first_name,
      firstName: userObj.first_name,
      lastName: userObj.last_name,
      email: userObj.email,
      phone: userObj.phone_number,
      created: new Date(userObj.created + "Z"),
      avatarURL: getGravatarURL(userObj.email ?? "", { size: avatarSize ?? 200, default: userObj.guest ? "mp" : "identicon" }),
      guest: userObj.guest,
      superAdmin: userObj.super_admin,
      publicEmail: userObj.public_email ?? false,
      publicPhone: userObj.public_phone ?? false,
      eventInfo: withEventData && userObj.event_id && userObj.event_joined_time ? {
        id: userObj.event_id,
        isAdmin: userObj.is_event_admin ?? false,
        joinedTime: userObj.event_joined_time
      } : undefined
    };
    allUsers.push(user);
    if (!excludeGuests || (excludeGuests && !user.guest)) {
      users.push(user);
    }
  });

  // Set unique names of users where they are shared
  setDisplayNames(users, allUsers);
  for (const user of users) {
    delete user.firstName;
    delete user.lastName;
  }

  return users;
};

/**
 * Build array of Guest user objects
 * @param usersInput List of UserDB objects
 * @param avatarSize Pixel size of user avatar
 * @returns List of Guest user objects
 */
export const parseGuestUsers = (usersInput: UserDB[], avatarSize?: number): Guest[] => {
  const guests: Guest[] = [];
  usersInput.forEach(userObj => {
    if (!userObj.guest) {
      return;
    }

    if (userObj.deleted) {
      const user: Guest = {
        id: userObj.id,
        name: "Deleted user",
        firstName: "Deleted user",
        lastName: "",
        avatarURL: getGravatarURL("", { size: avatarSize ?? 200, default: "mp" }),
        guest: userObj.guest
      };
      guests.push(user);
      return;
    }

    const user: Guest = {
      id: userObj.id,
      name: userObj.first_name,
      firstName: userObj.first_name,
      lastName: userObj.last_name,
      avatarURL: getGravatarURL(userObj.email ?? "", { size: avatarSize ?? 200, default: "mp" }),
      guest: userObj.guest,
      guestCreatedBy: userObj.guest_created_by
    };
    guests.push(user);
  });

  for (const guest of guests) {
    if (guest.lastName) {
      guest.name = guest.firstName + " " + guest.lastName;
    }
  }

  return guests;
};

/**
 * Parse single User object
 * @param userObj UserDB object
 * @param avatarSize Pixel size of user avatar
 * @returns User object
 */
export const parseUser = (userObj: UserDB, avatarSize?: number): User => {
  return {
    id: userObj.id,
    username: userObj.username,
    name: userObj.first_name,
    firstName: userObj.first_name,
    lastName: userObj.last_name,
    email: userObj.email,
    phone: userObj.phone_number,
    created: new Date(userObj.created + "Z"),
    avatarURL: getGravatarURL(userObj.email ?? "", { size: avatarSize ?? 200, default: userObj.guest ? "mp" : "identicon" }),
    guest: userObj.guest,
    superAdmin: userObj.super_admin,
    publicEmail: userObj.public_email ?? false,
    publicPhone: userObj.public_phone ?? false
  };
};

/**
 * Parse single Guest user object
 * @param userObj UserDB object
 * @param avatarSize Pixel size of user avatar
 * @returns Guest object
 */
export const parseGuestUser = (userObj: UserDB, avatarSize?: number): Guest => {
  return {
    id: userObj.id,
    name: userObj.first_name,
    firstName: userObj.first_name,
    lastName: userObj.last_name,
    avatarURL: getGravatarURL(userObj.email ?? "", { size: avatarSize ?? 200, default: "mp" }),
    guest: userObj.guest,
    guestCreatedBy: userObj.guest_created_by
  };
};
