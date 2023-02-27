import express from "express";
import * as db from "../db/dbExpenses";
import { checkAuth } from "../middleware/authMiddleware";
import { Expense } from "../types/types";
const router = express.Router();

/* --- */
/* GET */
/* --- */

// Get a list of all expenses for a given event
router.get("/expenses", checkAuth, async (req, res, next) => {
  const eventId = Number(req.query.eventId);
  if (!req.query.eventId || isNaN(eventId)) {
    return res.status(400).json({ error: "Event ID is not provided, or is not a number" });
  }
  try {
    const expenses: Expense[] = await db.getExpenses(eventId);
    res.status(200).send(expenses);
  }
  catch (err) {
    next(err);
  }
});

/* ---- */
/* POST */
/* ---- */

// Create a new expense
router.post("/expenses", checkAuth, async (req, res, next) => {
  if (!req.body.name || !req.body.amount || !req.body.categoryId || !req.body.payerId) {
    return res.status(400).json({ error: "Name, amount, category ID or payer ID not provided" });
  }
  try {
    const expense: Expense = await db.createExpense(req.body.name, req.body.description, req.body.amount, req.body.categoryId, req.body.payerId);
    res.status(200).send(expense);
  }
  catch (err) {
    next(err);
  }
});

/* ------ */
/* DELETE */
/* ------ */

// Delete an expense
router.delete("/expenses/:expenseId", checkAuth, async (req, res, next) => {
  const expenseId = Number(req.params.expenseId);
  if (isNaN(expenseId)) {
    return res.status(400).json({ error: "Expense ID must be a number" });
  }
  try {
    const success = await db.deleteExpense(expenseId);
    res.status(200).send(success);
  }
  catch (err) {
    next(err);
  }
});

export default router;
