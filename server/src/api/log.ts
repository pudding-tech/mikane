import express from "express";
import { authCheck } from "../middlewares/authCheck.ts";
import { logToDatabase } from "../db/dbLog.ts";
import { ALLOWED_LOG_LEVELS, type LogLevelType } from "../env.ts";
import { ErrorExt } from "../types/errorExt.ts";
import { PUD144, PUD145 } from "../types/errorCodes.ts";

const router = express.Router();

/*
* Save log message to database
*/
router.post("/log", authCheck, async (req, res) => {
  const msg: string = req.body.message;
  const level: LogLevelType | undefined = req.body.level;

  if (!msg || msg.trim().length === 0 || msg.length > 1000) {
    throw new ErrorExt(PUD144);
  }

  if (level && !ALLOWED_LOG_LEVELS.includes(level)) {
    throw new ErrorExt(PUD145);
  }

  await logToDatabase({
    timestamp: new Date(),
    level: level ?? "info",
    origin: "client",
    message: msg.trim(),
  });

  res.status(200).json({ message: "Log successfully received" });
});

export default router;
