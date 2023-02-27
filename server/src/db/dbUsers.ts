import sql from "mssql";
import { parseExpenses, parseUser, parseUsers } from "../parsers";
import { Expense, User } from "../types/types";

/**
 * DB interface: Get user information
 * @param userId 
 * @param username
 * @returns User data
 */
export const getUser = async (userId: number | null, username?: string | null) => {
  const request = new sql.Request();
  const user: User = await request
    .input("user_id", sql.Int, userId)
    .input("username", sql.NVarChar, username)
    .execute("get_user")
    .then(data => {
      return parseUser(data.recordset[0]);
    });
  return user;
};

/**
 * DB interface: Get all users, optionally for an event
 * @param eventId Event ID for event to get users for
 * @returns List of users
 */
export const getUsers = async (eventId: number) => {
  const request = new sql.Request();
  return request
    .input("event_id", sql.Int, eventId)
    .execute("get_users")
    .then(data => {
      const users: User[] = parseUsers(data.recordset);
      return users;
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
    .execute("get_expenses")
    .then(data => {
      return parseExpenses(data.recordset);
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
    });
  return user;
};

/**
 * DB interface: Edit a user
 * @param userId User ID to edit
 * @param name New name of user
 * @returns Edited user
 */
export const editUser = async (userId: number, username: string) => {
  const request = new sql.Request();
  const user: User = await request
    .input("user_id", sql.Int, userId)
    .input("username", sql.NVarChar, username)
    .execute("edit_user")
    .then(data => {
      return parseUser(data.recordset[0]);
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
    });
  return success;
};
