import express from "express";
import sql from "mssql";
import { Expense } from "../types";
import { buildExpenses } from "../parsers";
const router = express.Router();

router.get("/expenses", (req, res, next) => {
  if (!req.query.eventId) {
    return res.status(400).send("EventId not provided!");
  }
  const request = new sql.Request();
  request
    .input("event_id", sql.Int, req.query.eventId)
    .execute("get_expenses")
    .then( (data) => {
      const expenses: Expense[] = buildExpenses(data.recordset);
      res.send(expenses);
    })
    .catch(next);
});

router.post("/expenses", (req, res, next) => {
  if (!req.body.name || !req.body.description || !req.body.categoryId || !req.body.payerId) {
    return res.status(400).send("Name, description, categoryId or payerId not provided!");
  }
  console.log(req.body.amount);
  const request = new sql.Request();
  request
    .input("name", sql.NVarChar, req.body.name)
    .input("description", sql.NVarChar, req.body.description)
    .input("amount", sql.Numeric(16, 2), req.body.amount)
    .input("category_id", sql.Int, req.body.categoryId)
    .input("payer_id", sql.Int, req.body.payerId)
    .execute("new_expense")
    .then( (data) => {
      res.send(data.recordset);
    })
    .catch(next);
});

export default router;