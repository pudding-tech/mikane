import { pool } from "../db.ts";
import { parseGuestUser, parseGuestUsers } from "../parsers/parseUsers.ts";
import { Guest } from "../types/types.ts";
import { ErrorExt } from "../types/errorExt.ts";
import * as ec from "../types/errorCodes.ts";

/**
 * DB interface: Get all guest users
 * @returns List of guest users
 */
export const getGuestUsers = async () => {
  const query = {
    text: "SELECT * FROM get_users(null, null, false, null);"
  };
  const users: Guest[] = await pool.query(query)
    .then(data => {
      return parseGuestUsers(data.rows, 80);
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
 * DB interface: Add a new guest user to the database
 * @param id 
 * @param firstName 
 * @param lastName 
 * @param activeUserId ID of signed-in user
 * @returns Newly created guest user
 */
export const createGuestUser = async (id: string, firstName: string, lastName: string, activeUserId: string) => {
  const query = {
    text: "SELECT * FROM new_guest_user($1, $2, $3, $4);",
    values: [id, firstName, lastName, activeUserId]
  };
  const guestUser: Guest = await pool.query(query)
    .then(data => {
      return parseGuestUser(data.rows[0]);
    })
    .catch(err => {
      if (err.code === "P0008")
        throw new ErrorExt(ec.PUD008, err);
      else
        throw new ErrorExt(ec.PUD123, err);
    });

  return guestUser;
};

/**
 * DB interface: Edit a guest user
 * @param guestId Guest ID to edit
 * @param data Data object
 * @param activeUserId ID of signed-in user
 * @returns Edited user
 */
export const editGuestUser = async (guestId: string, data: { firstName?: string, lastName?: string }, activeUserId: string) => {
  const query = {
    text: "SELECT * FROM edit_guest_user($1, $2, $3, $4);",
    values: [guestId, data.firstName, data.lastName, activeUserId]
  };
  const guestUser: Guest = await pool.query(query)
    .then(data => {
      return parseGuestUser(data.rows[0]);
    })
    .catch(err => {
      if (err.code === "P0130")
        throw new ErrorExt(ec.PUD130, err);
      else if (err.code === "P0122")
        throw new ErrorExt(ec.PUD122, err);
      else
        throw new ErrorExt(ec.PUD124, err);
    });

  return guestUser;
};

/**
 * DB interface: Delete a guest user
 * @param guestId 
 * @param activeUserId ID of signed-in user
 * @returns True if successful
 */
export const deleteGuestUser = async (guestId: string, activeUserId: string) => {
  const query = {
    text: "SELECT * FROM delete_guest_user($1, $2);",
    values: [guestId, activeUserId]
  };
  const success = await pool.query(query)
    .then(() => {
      return true;
    })
    .catch(err => {
      if (err.code === "P0129")
        throw new ErrorExt(ec.PUD129, err);
      else if (err.code === "P0122")
        throw new ErrorExt(ec.PUD122, err);
      else if (err.code === "P0120")
        throw new ErrorExt(ec.PUD120, err);
      else
        throw new ErrorExt(ec.PUD125, err);
    });

  return success;
};
