import sql from "mssql";
import { PUD033, PUD063, PUD064, PUD070, PUD075, PUD076, PUD077 } from "../types/errorCodes";
import { ErrorExt } from "../types/errorExt";
import { parseApiKeys } from "../parsers";
import { randomUUID } from "crypto";

/**
 * DB interface: Get user password hash
 * @param usernameEmail
 * @param userId
 * @returns User's hashed password
 */
export const getUserHash = async (usernameEmail?: string, userId?: number) => {
  const request = new sql.Request();
  const userHash = await request
    .input("usernameEmail", sql.NVarChar, usernameEmail)
    .input("user_id", sql.Int, userId)
    .execute("get_user_hash")
    .then(data => {
      if (data.recordset.length < 1) {
        return null;
      }
      return {
        id: data.recordset[0].id as number,
        hash: data.recordset[0].password as string
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
  const request = new sql.Request();
  const keys = await request
    .input("master", sql.Bit, masterOnly)
    .execute("get_api_keys")
    .then(data => {
      return parseApiKeys(data.recordset);
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
  const request = new sql.Request();
  const key = await request
    .input("uuid", sql.UniqueIdentifier, uuid)
    .input("name", sql.NVarChar, name)
    .input("hashed_key", sql.NVarChar, hash)
    .input("master", sql.Bit, false)
    .input("valid_from", sql.DateTime, validFrom)
    .input("valid_to", sql.DateTime, validTo)
    .execute("new_api_key")
    .then(data => {
      return parseApiKeys(data.recordset);
    })
    .catch(err => {
      if (err.number === 50070)
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
export const newPasswordResetKey = async (userId: number, key: string) => {
  const request = new sql.Request();
  await request
    .input("user_id", sql.Int, userId)
    .input("key", sql.NVarChar, key)
    .execute("new_password_reset_key")
    .catch(err => {
      throw new ErrorExt(PUD075, err);
    });
};

/**
 * DB interface: Verify that a password reset key is valid (not used and not expired)
 * @param key 
 */
export const verifyPasswordResetKey = async (key: string) => {
  const request = new sql.Request();
  const keyExists = await request
    .input("key", sql.NVarChar, key)
    .execute("verify_password_reset_key")
    .then(data => {
      return data.recordset[0] ? true : false;
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
  const request = new sql.Request();
  await request
    .input("key", sql.NVarChar, key)
    .input("password", sql.NVarChar, hash)
    .execute("reset_password")
    .catch(err => {
      throw new ErrorExt(PUD077, err);
    });
};
