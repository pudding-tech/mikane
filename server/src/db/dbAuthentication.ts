import sql from "mssql";
import { PUD033, PUD063, PUD064, PUD070 } from "../types/errorCodes";
import { ErrorExt } from "../types/errorExt";
import { parseApiKeys } from "../parsers";
import { randomUUID } from "crypto";

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
        throw new ErrorExt(PUD070, err, 400);
      else
        throw new ErrorExt(PUD064, err);
    });

  return key[0];
};
