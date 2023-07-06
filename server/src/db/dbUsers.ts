import sql from "mssql";
import { parseExpenses } from "../parsers/parseExpenses";
import { parseUser, parseUsers } from "../parsers/parseUsers";
import { Expense, User } from "../types/types";
import { ErrorExt } from "../types/errorExt";
import * as ec from "../types/errorCodes";

/**
 * DB interface: Get user information
 * @param userId 
 * @param username
 * @returns User data
 */
export const getUser = async (userId: string | null, username?: string | null) => {
  const request = new sql.Request();
  const user: User | null = await request
    .input("user_uuid", sql.UniqueIdentifier, userId)
    .input("username", sql.NVarChar, username)
    .execute("get_user")
    .then(data => {
      if (!data.recordset[0]) {
        return null;
      }
      return parseUser(data.recordset[0]);
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
  const request = new sql.Request();
  const userId: string | null = await request
    .input("email", sql.NVarChar, email)
    .execute("get_user_id")
    .then(data => {
      return data.recordset[0]?.id || null;
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
  const request = new sql.Request();
  return request
    .input("event_uuid", sql.UniqueIdentifier, filter?.eventId)
    .input("exclude_user_uuid", sql.UniqueIdentifier, filter?.excludeUserId)
    .execute("get_users")
    .then(data => {
      const users: User[] = parseUsers(data.recordset, true);
      return users;
    })
    .catch(err => {
      throw new ErrorExt(ec.PUD035, err);
    });
};

/**
 * DB interface: Get list of a user's expenses in an event
 * @param userId 
 * @param eventId 
 * @returns List of expenses
 */
export const getUserExpenses = async (userId: string, eventId: string) => {
  const request = new sql.Request();
  const expenses: Expense[] = await request
    .input("event_uuid", sql.UniqueIdentifier, eventId)
    .input("user_uuid", sql.UniqueIdentifier, userId)
    .input("expense_uuid", sql.UniqueIdentifier, null)
    .execute("get_expenses")
    .then(data => {
      return parseExpenses(data.recordset);
    })
    .catch(err => {
      if (err.number === 50006)
        throw new ErrorExt(ec.PUD006);
      else if (err.number === 50008)
        throw new ErrorExt(ec.PUD008);
      else if (err.number === 50084)
        throw new ErrorExt(ec.PUD084);
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
  const request = new sql.Request();
  const user: User = await request
    .input("username", sql.NVarChar, username)
    .input("first_name", sql.NVarChar, firstName)
    .input("last_name", sql.NVarChar, lastName)
    .input("email", sql.NVarChar, email)
    .input("phone_number", sql.NVarChar, phone)
    .input("password", sql.NVarChar, hash)
    .execute("new_user")
    .then(data => {
      return parseUser(data.recordset[0]);
    })
    .catch(err => {
      if (err.number === 50017)
        throw new ErrorExt(ec.PUD017, err);
      else if (err.number === 50018)
        throw new ErrorExt(ec.PUD018, err);
      else if (err.number === 50019)
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
  const request = new sql.Request();
  const user: User | null = await request
    .input("user_uuid", sql.UniqueIdentifier, userId)
    .input("username", sql.NVarChar, data.username)
    .input("first_name", sql.NVarChar, data.firstName)
    .input("last_name", sql.NVarChar, data.lastName)
    .input("email", sql.NVarChar, data.email)
    .input("phone_number", sql.NVarChar, data.phone)
    .execute("edit_user")
    .then(data => {
      if (!data.recordset[0]) {
        return null;
      }
      return parseUser(data.recordset[0]);
    })
    .catch(err => {
      if (err.number === 50017)
        throw new ErrorExt(ec.PUD017, err);
      else if (err.number === 50018)
        throw new ErrorExt(ec.PUD018, err);
      else if (err.number === 50019)
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
  const request = new sql.Request();
  const success = request
    .input("user_uuid", sql.UniqueIdentifier, userId)
    .execute("delete_user")
    .then(() => {
      return true;
    })
    .catch(err => {
      if (err.number === 50008)
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
  const request = new sql.Request();
  const success = await request
    .input("user_uuid", sql.UniqueIdentifier, userId)
    .input("password", sql.NVarChar, hash)
    .execute("change_password")
    .then(() => {
      return true;
    })
    .catch(err => {
      throw new ErrorExt(ec.PUD082, err);
    });
  return success;
};
