import express from "express";
import * as db from "../db/dbExpenses";
import { authCheck } from "../middlewares/authCheck";
import { isUUID } from "../utils/uuidValidator";
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
    const eventId = req.query.eventId as string;
    if (!isUUID(eventId)) {
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
    const expenseId = req.params.id;
    if (!isUUID(expenseId)) {
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

    const name: string = req.body.name;
    const description: string | undefined = req.body.description;
    const categoryId = req.body.categoryId as string;
    const payerId = req.body.payerId as string;
    const amount = Number(req.body.amount);
    if (!isUUID(categoryId)) {
      throw new ErrorExt(ec.PUD045);
    }
    if (!isUUID(payerId)) {
      throw new ErrorExt(ec.PUD089);
    }
    if (isNaN(amount)) {
      throw new ErrorExt(ec.PUD088);
    }
    if (amount < 0) {
      throw new ErrorExt(ec.PUD030);
    }
    if (name.trim() === "") {
      throw new ErrorExt(ec.PUD059);
    }

    const expense: Expense = await db.createExpense(name, amount, categoryId, payerId, description);
    res.status(200).send(expense);
  }
  catch (err) {
    next(err);
  }
});

/* --- */
/* PUT */
/* --- */

/*
* Edit expense
*/
router.put("/expenses/:id", authCheck, async (req, res, next) => {
  try {
    const expenseId = req.params.id;
    if (!isUUID(expenseId)) {
      throw new ErrorExt(ec.PUD056);
    }

    const name: string | undefined = req.body.name;
    const description: string | undefined = req.body.description;
    const amount: number | undefined = req.body.amount !== undefined ? Number(req.body.amount) : undefined;
    const categoryId: string | undefined = req.body.categoryId;
    const payerId: string | undefined = req.body.payerId;

    if (!name && !description && !categoryId && !amount && !payerId) {
      throw new ErrorExt(ec.PUD116);
    }
    if (categoryId && !isUUID(categoryId)) {
      throw new ErrorExt(ec.PUD045);
    }
    if (payerId && !isUUID(payerId)) {
      throw new ErrorExt(ec.PUD089);
    }
    if (amount && isNaN(amount)) {
      throw new ErrorExt(ec.PUD088);
    }
    if (amount && amount < 0) {
      throw new ErrorExt(ec.PUD030);
    }
    if (name?.trim() === "" || description?.trim() === "") {
      throw new ErrorExt(ec.PUD059);
    }

    const data = {
      name: name,
      description: description,
      amount: amount,
      categoryId: categoryId,
      payerId: payerId
    };

    const expense = await db.editExpense(expenseId, data);
    if (!expense) {
      throw new ErrorExt(ec.PUD084);
    }
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
    const expenseId = req.params.id;
    if (!isUUID(expenseId)) {
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
