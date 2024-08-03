import { pool } from "../db";
import { PUD143 } from "../types/errorCodes";
import { Config } from "../types/types";
import { ErrorExt } from "../types/errorExt";

/**
 * DB interface: Get application configuration
 * @returns List of all configurations
 */
export const getConfig = async () => {
  const query = {
    text: "SELECT * FROM get_config();"
  };
  const config = await pool.query(query)
    .then(data => {
      return data.rows as Config[];
    })
    .catch(err => {
      throw new ErrorExt(PUD143, err);
    });

  return config;
};
