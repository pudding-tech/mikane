import Log, { Middleware } from "adze";
import env from "../env.js";
import { logServerToDatabase } from "../db/dbLog.ts";

const levelMap = { alert: 0, error: 1, warn: 2, info: 3, fail: 4, success: 5, log: 6, debug: 7, verbose: 8 } as const;

export class DbLogger extends Middleware {
  constructor() {
    super("server");
  }

  afterTerminated(log: Log, _terminator: string, args: unknown[]) {
    const { levelName, level, timestamp } = log.data ?? {};
    if (!levelName || level === undefined || typeof level !== "number" || !timestamp) {
      console.error("DbLogger: Invalid log data, skipping log to database");
      return;
    }

    // Do not log to DB if the level is higher than the active log level
    const activeLevel = levelMap[env.LOG_LEVEL];
    if (level > activeLevel) {
      return;
    }

    // Do not log to DB in local dev environment
    if (env.NODE_ENV === "dev" && !env.DEPLOYED) {
      return;
    }

    logServerToDatabase({
      timestamp: new Date(timestamp),
      level: levelName,
      message: args.join(" "),
    });
  }
}
