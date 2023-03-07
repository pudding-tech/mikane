import sql from "mssql";
import { parseExpenses, parseUser, parseUsers } from "../parsers";
import { Expense, User } from "../types/types";
import { ErrorExt } from "../types/errorExt";
import * as ec from "../types/errorCodes";

/**
 * DB interface: Get user information
 * @param userId 
 * @param username
 * @returns User data
 */
export const getUser = async (userId: number | null, username?: string | null) => {
  const request = new sql.Request();
  const user: User | null = await request
    .input("user_id", sql.Int, userId)
    .input("username", sql.NVarChar, username)
    .execute("get_user")
    .then(data => {
      if (!data.recordset[0]) {
        return null;
      }
      return parseUser(data.recordset[0]);
    })
    .catch(err => {
      console.log(err);
      throw new ErrorExt(ec.PUD034);
    });
  return user;
};

/**
 * DB interface: Get all users, optionally filtered
 * @param filter Object containing filters (event ID, user ID to exclude)
 * @returns List of users
 */
export const getUsers = async (filter?: { eventId?: number, excludeUserId?: number }) => {
  const request = new sql.Request();
  return request
    .input("event_id", sql.Int, filter?.eventId)
    .input("exclude_user_id", sql.Int, filter?.excludeUserId)
    .execute("get_users")
    .then(data => {
      const users: User[] = parseUsers(data.recordset);
      return users;
    })
    .catch(err => {
      console.log(err);
      throw new ErrorExt(ec.PUD035);
    });
};

/**
 * DB interface: Get list of a user's expenses in an event
 * @param userId 
 * @param eventId 
 * @returns List of expenses
 */
export const getUserExpenses = async (userId: number, eventId: number) => {
  const request = new sql.Request();
  const expenses: Expense[] = await request
    .input("event_id", sql.Int, eventId)
    .input("user_id", sql.Int, userId)
    .input("expense_id", sql.Int, null)
    .execute("get_expenses")
    .then(data => {
      return parseExpenses(data.recordset);
    })
    .catch(err => {
      console.log(err);
      throw new ErrorExt(ec.PUD032);
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
        throw new ErrorExt(ec.PUD017, 400);
      else if (err.number === 50018)
        throw new ErrorExt(ec.PUD018, 400);
      else if (err.number === 50019)
        throw new ErrorExt(ec.PUD019, 400);
      else {
        console.log(err);
        throw new ErrorExt(ec.PUD038);
      }
    });
  return user;
};

/**
 * DB interface: Edit a user
 * @param userId User ID to edit
 * @param data Data object
 * @returns Edited user
 */
export const editUser = async (userId: number, data: { username?: string, firstName?: string, lastName?: string, email?: string, phone?: string }) => {
  const request = new sql.Request();
  const user: User = await request
    .input("user_id", sql.Int, userId)
    .input("username", sql.NVarChar, data.username)
    .input("first_name", sql.NVarChar, data.firstName)
    .input("last_name", sql.NVarChar, data.lastName)
    .input("email", sql.NVarChar, data.email)
    .input("phone_number", sql.NVarChar, data.phone)
    .execute("edit_user")
    .then(data => {
      return parseUser(data.recordset[0]);
    })
    .catch(err => {
      console.log(err);
      throw new ErrorExt(ec.PUD028);
    });
  return user;
};

/**
 * DB interface: Delete a user
 * @param userId 
 * @returns True if successful
 */
export const deleteUser = async (userId: number) => {
  const request = new sql.Request();
  const success = request
    .input("user_id", sql.Int, userId)
    .execute("delete_user")
    .then(() => {
      return true;
    })
    .catch(err => {
      console.log(err);
      throw new ErrorExt(ec.PUD025);
    });
  return success;
};
