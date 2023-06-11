import express from "express";
import * as db from "../db/dbExpenses";
import { authCheck } from "../middlewares/authCheck";
import { Expense } from "../types/types";
import { ErrorExt } from "../types/errorExt";
import * as ec from "../types/errorCodes";
const router = express.Router();

/* --- */
/* GET */
/* --- */

/*
* Get a list of all expenses for a given event
*/
router.get("/expenses", authCheck, async (req, res, next) => {
  try {
    const eventId = Number(req.query.eventId);
    if (!req.query.eventId || isNaN(eventId)) {
      throw new ErrorExt(ec.PUD013);
    }

    const expenses: Expense[] = await db.getExpenses(eventId);
    res.status(200).send(expenses);
  }
  catch (err) {
    next(err);
  }
});

/*
* Get a specific expense
*/
router.get("/expenses/:id", authCheck, async (req, res, next) => {
  try {
    const expenseId = Number(req.params.id);
    if (isNaN(expenseId)) {
      throw new ErrorExt(ec.PUD056);
    }

    const expense: Expense | null = await db.getExpense(expenseId);
    if (!expense) {
      throw new ErrorExt(ec.PUD084);
    }
    res.status(200).send(expense);
  }
  catch (err) {
    next(err);
  }
});

/* ---- */
/* POST */
/* ---- */

/*
* Create a new expense
*/
router.post("/expenses", authCheck, async (req, res, next) => {
  try {
    if (!req.body.name || !req.body.amount || !req.body.categoryId || !req.body.payerId) {
      throw new ErrorExt(ec.PUD057);
    }

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

/*
* Delete an expense
*/
router.delete("/expenses/:id", authCheck, async (req, res, next) => {
  try {
    const expenseId = Number(req.params.id);
    if (isNaN(expenseId)) {
      throw new ErrorExt(ec.PUD056);
    }
    const userId = req.session.userId;
    if (!userId) {
      throw new ErrorExt(ec.PUD055);
    }

    const success = await db.deleteExpense(expenseId, userId);
    res.status(200).send({ success: success });
  }
  catch (err) {
    next(err);
  }
});

export default router;
