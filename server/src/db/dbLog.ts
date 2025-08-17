import { pool } from "../db.ts";
import { ErrorExt } from "../types/errorExt.ts";
import { LogEntryDB } from "../types/types.ts";
import { PUD146 } from "../types/errorCodes.ts";

/**
 * DB interface: Insert a log entry into the database
 * @param log - The log entry to insert
 */
export const logToDatabase = async (log: LogEntryDB) => {
  const query = {
    text: "SELECT * FROM log_to_db($1, $2, $3, $4);",
    values: [log.timestamp, log.level, log.origin, log.message],
  };
  await pool.query(query)
    .catch(err => {
      throw new ErrorExt(PUD146, err);
    });
};
