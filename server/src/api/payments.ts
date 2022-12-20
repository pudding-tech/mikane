import express from "express";
import sql from "mssql";
import { checkAuth } from "./middleware/authMiddleware";
import { calculatePayments } from "../calculations";
import { parseCategories, parseExpenses, parseUsers } from "../parsers";
import { User, Category, Expense, Payment } from "../types/types";
const router = express.Router();

/* --- */
/* GET */
/* --- */

// Get a list of all payments for a given event
router.get("/payments", checkAuth, async (req, res, next) => {
  if (!req.query.eventId) {
    return res.status(400).send("EventId not provided!");
  }

  const request = new sql.Request();
  const data = await request
    .input("event_id", sql.Int, req.query.eventId)
    .execute("get_event_payment_data")
    .then(res => {
      return res.recordsets as sql.IRecordSet<object>[];
    })
    .catch(err => next(err));

  if (!data || data.length < 3) {
    return res.status(400).send("Something went wrong getting users, categories or expenses");
  }

  const users: User[] = parseUsers(data[0]);
  const categories: Category[] = parseCategories(data[1], "calc");
  const expenses: Expense[] = parseExpenses(data[2]);

  const payments: Payment[] = calculatePayments(expenses, categories, users);
  res.send(payments);
});

export default router;
