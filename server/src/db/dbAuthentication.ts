import { pool } from "../db";
import { PUD033, PUD063, PUD064, PUD070, PUD075, PUD076, PUD077 } from "../types/errorCodes";
import { ErrorExt } from "../types/errorExt";
import { parseApiKeys } from "../parsers/parseKeys";
import { randomUUID } from "crypto";

/**
 * DB interface: Get user password hash
 * @param usernameEmail
 * @param userId
 * @returns User's hashed password
 */
export const getUserHash = async (usernameEmail?: string, userId?: string) => {
  const query = {
    text: "SELECT * FROM get_user_hash($1, $2);",
    values: [usernameEmail, userId]
  };
  const userHash = await pool.query(query)
    .then(data => {
      if (data.rows.length < 1) {
        return null;
      }
      return {
        id: data.rows[0].id as string,
        hash: data.rows[0].password as string
      };
    })
    .catch(err => {
      throw new ErrorExt(PUD033, err);
    });

  return userHash;
};

/**
 * DB interface: Get list of all API keys
 * @param type Type of keys to be returned
 * @returns List of API keys
 */
export const getApiKeys = async (type: "normal" | "master" | "all") => {
  let masterOnly: boolean | null = null;
  switch (type) {
    case "normal":
      masterOnly = false;
      break;
    case "master":
      masterOnly = true;
      break;
  }

  const query = {
    text: "SELECT * FROM get_api_keys($1);",
    values: [masterOnly]
  };
  const keys = await pool.query(query)
    .then(data => {
      return parseApiKeys(data.rows);
    })
    .catch(err => {
      throw new ErrorExt(PUD063, err);
    });

  return keys;
};

/**
 * DB interface: Add a new API key to the database
 * @param name Name of API key
 * @param hash Hashed key with salt appended
 * @param validFrom Date API key is valid from (optional)
 * @param validTo Date API key is valid to (optional)
 */
export const newApiKey = async (name: string, hash: string, validFrom?: Date, validTo?: Date) => {
  const uuid = randomUUID();
  const query = {
    text: "SELECT * FROM new_api_key($1, $2, $3, $4, $5, $6);",
    values: [uuid, name, hash, false, validFrom, validTo]
  };
  const key = await pool.query(query)
    .then(data => {
      return parseApiKeys(data.rows);
    })
    .catch(err => {
      if (err.code === "P0070")
        throw new ErrorExt(PUD070, err);
      else
        throw new ErrorExt(PUD064, err);
    });

  return key[0];
};

/**
 * DB interface: Add new password reset request key to database
 * @param userId 
 * @param key 
 */
export const newPasswordResetKey = async (userId: string, key: string) => {
  const query = {
    text: "SELECT * FROM new_password_reset_key($1, $2);",
    values: [userId, key]
  };
  await pool.query(query)
    .catch(err => {
      throw new ErrorExt(PUD075, err);
    });
};

/**
 * DB interface: Verify that a password reset key is valid (not used and not expired)
 * @param key 
 */
export const verifyPasswordResetKey = async (key: string) => {
  const query = {
    text: "SELECT * FROM verify_password_reset_key($1);",
    values: [key]
  };
  const keyExists = await pool.query(query)
    .then(data => {
      return data.rows[0] ? true : false;
    })
    .catch(err => {
      throw new ErrorExt(PUD076, err);
    });

  return keyExists;
};

/**
 * DB interface: Reset a user's password. After resetting password, the key will be set as used
 * @param key Password reset key
 * @param hash Hashed new password
 */
export const resetPassword = async (key: string, hash: string) => {
  const query = {
    text: "SELECT * FROM reset_password($1, $2);",
    values: [key, hash]
  };
  await pool.query(query)
    .catch(err => {
      throw new ErrorExt(PUD077, err);
    });
};
