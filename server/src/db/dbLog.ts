import { pool } from "../db.ts";
import { ErrorExt } from "../types/errorExt.ts";
import { LogEntryClient, LogEntryServer } from "../types/types.ts";
import { PUD146, PUD147 } from "../types/errorCodes.ts";

/**
 * DB interface: Insert a server log entry into the database
 * @param log - The log entry to insert
 */
export const logServerToDatabase = async (log: LogEntryServer) => {
  const query = {
    text: "SELECT * FROM log_server_to_db($1, $2, $3);",
    values: [log.timestamp, log.level, log.message],
  };
  await pool.query(query)
    .catch(err => {
      throw new ErrorExt(PUD146, err);
    });
};

/**
 * DB interface: Insert a client log entry into the database
 * @param log - The log entry to insert
 */
export const logClientToDatabase = async (log: LogEntryClient) => {
  const query = {
    text: "SELECT * FROM log_client_to_db($1, $2, $3, $4, $5, $6);",
    values: [log.timestamp, log.level, log.message, log.userId, log.sessionId, log.ip],
  };
  await pool.query(query)
    .catch(err => {
      throw new ErrorExt(PUD147, err);
    });
};
