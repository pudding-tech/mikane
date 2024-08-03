import express from "express";
import * as db from "../db/dbConfig";
import { Config } from "../types/types";
const router = express.Router();

/* --- */
/* GET */
/* --- */

router.get("/config", async (req, res, next) => {
  try {
    const config: Config[] = await db.getConfig();
    res.send(config);
  }
  catch (err) {
    next(err);
  }
});

export default router;
