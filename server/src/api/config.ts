import express from "express";
import * as db from "../db/dbConfig.ts";
import { authCheck } from "../middlewares/authCheck.ts";
import { csrfCheck } from "../middlewares/csrf.ts";
import { useRateLimit } from "../middlewares/rateLimiter.ts";
import { Currency } from "../types/types.ts";
const router = express.Router();

/*
* Get supported currencies
*/
router.get("/currencies", useRateLimit(), authCheck, csrfCheck, async (_req, res) => {
  const currencies: Currency[] = await db.getCurrencies();
  res.status(200).send(currencies);
});

export default router;
