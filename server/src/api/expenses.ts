import express from "express";
import * as db from "../db/dbExpenses";
import { authCheck } from "../middlewares/authCheck";
import { Expense } from "../types/types";
import * as ec from "../types/errorCodes";
const router = express.Router();

/* --- */
/* GET */
/* --- */

// Get a list of all expenses for a given event
router.get("/expenses", authCheck, async (req, res, next) => {
  const eventId = Number(req.query.eventId);
  if (!req.query.eventId || isNaN(eventId)) {
    return res.status(400).json(ec.PUD013);
  }
  try {
    const expenses: Expense[] = await db.getExpenses(eventId);
    res.status(200).send(expenses);
  }
  catch (err) {
    next(err);
  }
});

// Get a specific expense
router.get("/expenses/:id", authCheck, async (req, res, next) => {
  const expenseId = Number(req.params.id);
  if (isNaN(expenseId)) {
    return res.status(400).json(ec.PUD056);
  }
  try {
    const expense: Expense = await db.getExpense(expenseId);
    res.status(200).send(expense);
  }
  catch (err) {
    next(err);
  }
});

/* ---- */
/* POST */
/* ---- */

// Create a new expense
router.post("/expenses", authCheck, async (req, res, next) => {
  if (!req.body.name || !req.body.amount || !req.body.categoryId || !req.body.payerId) {
    return res.status(400).json(ec.PUD057);
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
router.delete("/expenses/:id", authCheck, async (req, res, next) => {
  const expenseId = Number(req.params.id);
  if (isNaN(expenseId)) {
    return res.status(400).json(ec.PUD056);
  }
  try {
    const success = await db.deleteExpense(expenseId);
    res.status(200).send({ success: success });
  }
  catch (err) {
    next(err);
  }
});

export default router;
