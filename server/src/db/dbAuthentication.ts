import sql from "mssql";
import { PUD033 } from "../types/errorCodes";
import { ErrorExt } from "../types/errorExt";

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
      console.log(err);
      throw new ErrorExt(PUD033);
    });
  return userHash;
};
