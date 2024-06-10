import { pool } from "../db";
import { parseExpenses } from "../parsers/parseExpenses";
import { parseUser, parseUsers } from "../parsers/parseUsers";
import { Expense, User } from "../types/types";
import { ErrorExt } from "../types/errorExt";
import * as ec from "../types/errorCodes";

/**
 * DB interface: Get user information
 * @param userId
 * @param avatarSize Pixel size of user avatar
 * @param username
 * @returns User data
 */
export const getUser = async (userId: string | null, avatarSize?: number, username?: string | null) => {
  const query = {
    text: "SELECT * FROM get_user($1, $2, false)",
    values: [userId, username]
  };
  const user: User | null = await pool.query(query)
    .then(data => {
      if (!data.rows[0]) {
        return null;
      }
      return parseUser(data.rows[0], avatarSize);
    })
    .catch(err => {
      throw new ErrorExt(ec.PUD034, err);
    });

  return user;
};

/**
 * DB interface: Get user ID
 * @param email Email of user to get 
 * @returns User ID
 */
export const getUserID = async (email: string) => {
  const query = {
    text: "SELECT * FROM get_user_id($1)",
    values: [email]
  };
  const userId: string | null = await pool.query(query)
    .then(data => {
      return data.rows[0]?.id || null;
    })
    .catch(err => {
      throw new ErrorExt(ec.PUD071, err);
    });

  return userId;
};

/**
 * DB interface: Get all users, optionally filtered
 * @param activeUserId ID of signed-in user
 * @param filter Object containing filters (event ID, user ID to exclude)
 * @returns List of users
 */
export const getUsers = async (activeUserId: string, filter?: { eventId?: string, excludeGuests?: boolean, excludeUserId?: string }) => {
  const withDeleted = filter?.eventId ? null : false;
  const query = {
    text: "SELECT * FROM get_users($1, $2, $3, $4)",
    values: [filter?.eventId, filter?.excludeUserId, withDeleted, activeUserId]
  };
  const users: User[] = await pool.query(query)
    .then(data => {
      return parseUsers(data.rows, true, filter?.excludeGuests ?? false);
    })
    .catch(err => {
      if (err.code === "P0006")
        throw new ErrorExt(ec.PUD006);
      else
        throw new ErrorExt(ec.PUD035, err);
    });

  return users;
};

/**
 * DB interface: Get list of a user's expenses in an event
 * @param userId 
 * @param eventId 
 * @returns List of expenses
 */
export const getUserExpenses = async (userId: string, eventId: string) => {
  const query = {
    text: "SELECT * FROM get_expenses($1, $2, null)",
    values: [eventId, userId]
  };
  const expenses: Expense[] = await pool.query(query)
    .then(data => {
      return parseExpenses(data.rows);
    })
    .catch(err => {
      if (err.code === "P0006")
        throw new ErrorExt(ec.PUD006, err);
      else if (err.code === "P0008")
        throw new ErrorExt(ec.PUD008, err);
      else if (err.code === "P0084")
        throw new ErrorExt(ec.PUD084, err);
      else
        throw new ErrorExt(ec.PUD032, err);
    });

  return expenses;
};

/**
 * DB interface: Add a new user to the database
 * @param username 
 * @param firstName 
 * @param lastName 
 * @param email 
 * @param hash 
 * @param fromGuestId If user is to be created from a guest user, supply guest user's ID here
 * @returns Newly created user
 */
export const createUser = async (username: string, firstName: string, lastName: string, email: string, phone: string, hash: string) => {
  const query = {
    text: "SELECT * FROM new_user($1, $2, $3, $4, $5, $6)",
    values: [username, firstName, lastName, email, phone, hash]
  };
  const user: User = await pool.query(query)
    .then(data => {
      return parseUser(data.rows[0]);
    })
    .catch(err => {
      if (err.code === "P0017")
        throw new ErrorExt(ec.PUD017, err);
      else if (err.code === "P0018")
        throw new ErrorExt(ec.PUD018, err);
      else if (err.code === "P0019")
        throw new ErrorExt(ec.PUD019, err);
      else
        throw new ErrorExt(ec.PUD038, err);
    });

  return user;
};

/**
 * DB interface: Convert an existing guest user into a normal user
 * @param fromGuestId
 * @param username 
 * @param firstName 
 * @param lastName 
 * @param email 
 * @param hash 
 * @returns User
 */
export const convertGuestToUser = async (fromGuestId: string, username: string, firstName: string, lastName: string, email: string, phone: string, hash: string) => {
  const query = {
    text: "SELECT * FROM convert_guest_to_user($1, $2, $3, $4, $5, $6, $7)",
    values: [fromGuestId, username, firstName, lastName, email, phone, hash]
  };
  const user: User = await pool.query(query)
    .then(data => {
      return parseUser(data.rows[0]);
    })
    .catch(err => {
      if (err.code === "P0017")
        throw new ErrorExt(ec.PUD017, err);
      else if (err.code === "P0018")
        throw new ErrorExt(ec.PUD018, err);
      else if (err.code === "P0019")
        throw new ErrorExt(ec.PUD019, err);
      else if (err.code === "P0122")
        throw new ErrorExt(ec.PUD122, err);
      else
        throw new ErrorExt(ec.PUD127, err);
    });

  return user;
};

/**
 * DB interface: Edit a user
 * @param userId User ID to edit
 * @param data Data object
 * @returns Edited user
 */
export const editUser = async (userId: string, data: { username?: string, firstName?: string, lastName?: string, email?: string, phone?: string }) => {
  const query = {
    text: "SELECT * FROM edit_user($1, $2, $3, $4, $5, $6)",
    values: [userId, data.username, data.firstName, data.lastName, data.email, data.phone]
  };
  const user: User = await pool.query(query)
    .then(data => {
      return parseUser(data.rows[0]);
    })
    .catch(err => {
      if (err.code === "P0008")
        throw new ErrorExt(ec.PUD008, err);
      else if (err.code === "P0017")
        throw new ErrorExt(ec.PUD017, err);
      else if (err.code === "P0018")
        throw new ErrorExt(ec.PUD018, err);
      else if (err.code === "P0019")
        throw new ErrorExt(ec.PUD019, err);
      else
        throw new ErrorExt(ec.PUD028, err);
    });

  return user;
};

/**
 * DB interface: Edit a user's preferences
 * @param userId User ID to edit
 * @param data Data object
 * @returns Edited user
 */
export const editUserPreferences = async (userId: string, data: { publicEmail?: boolean, publicPhone?: boolean }) => {
  const query = {
    text: "SELECT * FROM edit_user_preferences($1, $2, $3)",
    values: [userId, data.publicEmail, data.publicPhone]
  };
  const user: User = await pool.query(query)
    .then(data => {
      return parseUser(data.rows[0]);
    })
    .catch(err => {
      if (err.code === "P0008")
        throw new ErrorExt(ec.PUD008, err);
      else if (err.code === "P0134")
        throw new ErrorExt(ec.PUD134, err);
      else
        throw new ErrorExt(ec.PUD135, err);
    });

  return user;
};

/**
 * DB interface: Delete a user
 * @param userId
 * @param key
 * @returns True if successful
 */
export const deleteUser = async (userId: string, key: string) => {
  const query = {
    text: "SELECT * FROM delete_user($1, $2)",
    values: [userId, key]
  };
  const success = await pool.query(query)
    .then(() => {
      return true;
    })
    .catch(err => {
      if (err.code === "P0008")
        throw new ErrorExt(ec.PUD008, err);
      else if (err.code === "P0108")
        throw new ErrorExt(ec.PUD108, err);
      else if (err.code === "P0120")
        throw new ErrorExt(ec.PUD120, err);
      else
        throw new ErrorExt(ec.PUD025, err);
    });

  return success;
};

/**
 * DB interface: Change a user's password
 * @param userId 
 * @param hash 
 * @returs True if successful
 */
export const changePassword = async (userId: string, hash: string) => {
  const query = {
    text: "SELECT * FROM change_password($1, $2)",
    values: [userId, hash]
  };
  const success = await pool.query(query)
    .then(() => {
      return true;
    })
    .catch(err => {
      throw new ErrorExt(ec.PUD082, err);
    });

  return success;
};

/**
 * DB interface: Add new register account key to database
 * @param email 
 * @param key 
 * @param guestId - Optional - for converting guest user to normal user
 */
export const newRegisterAccountKey = async (email: string, key: string, guestId?: string) => {
  const query = {
    text: "SELECT * FROM new_register_account_key($1, $2, $3);",
    values: [email, key, guestId]
  };
  await pool.query(query)
    .catch(err => {
      if (err.code === "P0103")
        throw new ErrorExt(ec.PUD103, err);
      if (err.code === "P0122")
        throw new ErrorExt(ec.PUD122, err);
      else
        throw new ErrorExt(ec.PUD099, err);
    });
};

/**
 * DB interface: Verify that a register account key is valid (not used and not expired)
 * @param key 
 * @returns Information about key, if it exists
 */
export const verifyRegisterAccountKey = async (key: string) => {
  const query = {
    text: "SELECT * FROM verify_register_account_key($1);",
    values: [key]
  };
  const keyInfo = await pool.query(query)
    .then(data => {
      return {
        email: data.rows[0]?.email as string | null,
        guestUser: data.rows[0]?.guest_user as boolean | null,
        firstName: data.rows[0]?.first_name as string | null,
        lastName: data.rows[0]?.last_name as string | null,
        guestId: data.rows[0]?.guest_id as string | null
      };
    })
    .catch(err => {
      throw new ErrorExt(ec.PUD100, err);
    });

  return keyInfo;
};

/**
 * DB interface: Set a register account key as used
 * @param key 
 */
export const invalidateRegisterAccountKey = async (key: string) => {
  const query = {
    text: "SELECT * FROM invalidate_register_account_key($1);",
    values: [key]
  };
  await pool.query(query)
    .catch(err => {
      throw new ErrorExt(ec.PUD102, err);
    });
};

/**
 * DB interface: Add new delete account key to database
 * @param userId 
 * @param key 
 */
export const newDeleteAccountKey = async (userId: string, key: string) => {
  const query = {
    text: "SELECT * FROM new_delete_account_key($1, $2);",
    values: [userId, key]
  };
  await pool.query(query)
    .catch(err => {
      throw new ErrorExt(ec.PUD104, err);
    });
};

/**
 * DB interface: Verify that a delete account key is valid (not used and not expired)
 * @param key 
 */
export const verifyDeleteAccountKey = async (key: string) => {
  const query = {
    text: "SELECT * FROM verify_delete_account_key($1);",
    values: [key]
  };
  const keyExists = await pool.query(query)
    .then(data => {
      return data.rows[0] ? true : false;
    })
    .catch(err => {
      throw new ErrorExt(ec.PUD105, err);
    });

  return keyExists;
};
