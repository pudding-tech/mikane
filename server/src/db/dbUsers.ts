import sql from "mssql";
import { parseUser, parseUsers } from "../parsers";
import { User } from "../types/types";

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
    .then(res => {
      if (!res.recordset[0]) {
        return null;
      }
      return parseUser(res.recordset[0]);
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
 * DB interface: Get user password hash
 * @param usernameEmail 
 * @returns User's hashed password
 */
export const getUserHash = async (usernameEmail: string) => {
  const request = new sql.Request();
  const userHash = await request
    .input("usernameEmail", sql.NVarChar, usernameEmail)
    .execute("get_user_hash")
    .then(data => {
      if (data.recordset.length < 1) {
        return null;
      }
      return {
        id: data.recordset[0].id as number,
        hash: data.recordset[0].password as string
      };
    });
  return userHash;
};
