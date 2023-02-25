import express from "express";
import sql from "mssql";
import { checkAuth } from "../middleware/authMiddleware";
import { parseExpenses } from "../parsers";
import { Expense } from "../types/types";
const router = express.Router();

/* --- */
/* GET */
/* --- */

// Get a list of all expenses for a given event
router.get("/expenses", checkAuth, (req, res, next) => {
  if (!req.query.eventId) {
    return res.status(400).send("EventId not provided!");
  }
  const request = new sql.Request();
  request
    .input("event_id", sql.Int, req.query.eventId)
    .input("user_id", sql.Int, null)
    .execute("get_expenses")
    .then(data => {
      const expenses: Expense[] = parseExpenses(data.recordset);
      res.send(expenses);
    })
    .catch(err => next(err));
});

/* ---- */
/* POST */
/* ---- */

// Create a new expense
router.post("/expenses", checkAuth, (req, res, next) => {
  if (!req.body.name || !req.body.categoryId || !req.body.payerId) {
    return res.status(400).send("Name, categoryId or payerId not provided!");
  }
  const request = new sql.Request();
  request
    .input("name", sql.NVarChar, req.body.name)
    .input("description", sql.NVarChar, req.body.description)
    .input("amount", sql.Numeric(16, 2), req.body.amount)
    .input("category_id", sql.Int, req.body.categoryId)
    .input("payer_id", sql.Int, req.body.payerId)
    .execute("new_expense")
    .then(data => {
      const expenses: Expense[] = parseExpenses(data.recordset);
      res.send(expenses[0]);
    })
    .catch(err => next(err));
});

/* ------ */
/* DELETE */
/* ------ */

// Delete an expense
router.delete("/expenses/:expenseId", checkAuth, (req, res, next) => {
  const expId = Number(req.params.expenseId);
  if (isNaN(expId)) {
    return res.status(400).send("Expense ID must be a number!");
  }
  const request = new sql.Request();
  request
    .input("expense_id", sql.Int, expId)
    .execute("delete_expense")
    .then(() => {
      res.send({});
    })
    .catch(err => next(err));
});

export default router;
