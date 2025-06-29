import { pool } from "../db.ts";
import { LogEntryDB } from "../types/types.ts";

/**
 * DB interface: Insert a log entry into the database
 * @param log - The log entry to insert
 */
export const logToDatabase = async (log: LogEntryDB) => {
  const query = {
    text: "SELECT * FROM log_to_db($1, $2, $3);",
    values: [log.timestamp, log.level, log.message],
  };
  await pool.query(query)
    .catch(err => {
      console.error("Error writing log to database", err);
    });
};
