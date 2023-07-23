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
    text: "SELECT * FROM get_user($1, $2)",
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
 * @param filter Object containing filters (event ID, user ID to exclude)
 * @returns List of users
 */
export const getUsers = async (filter?: { eventId?: string, excludeUserId?: string }) => {
  const query = {
    text: "SELECT * FROM get_users($1, $2)",
    values: [filter?.eventId, filter?.excludeUserId]
  };
  const users: User[] = await pool.query(query)
    .then(data => {
      return parseUsers(data.rows, true);
    })
    .catch(err => {
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
 * DB interface: Delete a user
 * @param userId 
 * @returns True if successful
 */
export const deleteUser = async (userId: string) => {
  const query = {
    text: "SELECT * FROM delete_user($1)",
    values: [userId]
  };
  const success = await pool.query(query)
    .then(() => {
      return true;
    })
    .catch(err => {
      if (err.code === "P0008")
        throw new ErrorExt(ec.PUD008, err);
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
 */
export const newRegisterAccountKey = async (email: string, key: string) => {
  const query = {
    text: "SELECT * FROM new_register_account_key($1, $2);",
    values: [email, key]
  };
  await pool.query(query)
    .catch(err => {
      throw new ErrorExt(ec.PUD099, err);
    });
};

/**
 * DB interface: Verify that a register account key is valid (not used and not expired)
 * @param key 
 */
export const verifyRegisterAccountKey = async (key: string) => {
  const query = {
    text: "SELECT * FROM verify_register_account_key($1);",
    values: [key]
  };
  const keyExists = await pool.query(query)
    .then(data => {
      return data.rows[0] ? true : false;
    })
    .catch(err => {
      throw new ErrorExt(ec.PUD100, err);
    });

  return keyExists;
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
