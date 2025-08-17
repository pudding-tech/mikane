import express from "express";
import { authCheck } from "../middlewares/authCheck.ts";
import { logClientToDatabase } from "../db/dbLog.ts";
import { createDate } from "../utils/dateCreator.ts";
import { ALLOWED_LOG_LEVELS, type LogLevelType } from "../env.ts";
import { ErrorExt } from "../types/errorExt.ts";
import { PUD055, PUD144, PUD145 } from "../types/errorCodes.ts";

const router = express.Router();

/*
* Save client log message in database
*/
router.post("/log", authCheck, async (req, res) => {
  const msg: string = req.body.message;
  const level: LogLevelType | undefined = req.body.level;
  const timestamp = req.body.timestamp ? createDate(req.body.timestamp) : new Date();
  const activeUserId = req.session.userId;

  if (!msg || msg.trim().length === 0 || msg.length > 1000) {
    throw new ErrorExt(PUD144);
  }

  if (level && !ALLOWED_LOG_LEVELS.includes(level)) {
    throw new ErrorExt(PUD145);
  }

  if (!activeUserId) {
    throw new ErrorExt(PUD055);
  }

  await logClientToDatabase({
    timestamp: timestamp,
    level: level ?? "info",
    message: msg.trim(),
    userId: activeUserId,
    sessionId: req.sessionID,
    ip: req.ip,
  });

  res.status(200).json({ message: "Log successfully received" });
});

export default router;
