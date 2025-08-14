import express from "express";
import * as db from "../db/dbExpenses.ts";
import { authCheck } from "../middlewares/authCheck.ts";
import { createDate } from "../utils/dateCreator.ts";
import { isUUID } from "../utils/validators/uuidValidator.ts";
import { Expense } from "../types/types.ts";
import { ErrorExt } from "../types/errorExt.ts";
import * as ec from "../types/errorCodes.ts";
const router = express.Router();

/* --- */
/* GET */
/* --- */

/*
* Get a list of all expenses for a given event
*/
router.get("/expenses", authCheck, async (req, res) => {
  const eventId = req.query.eventId as string;
  if (!isUUID(eventId)) {
    throw new ErrorExt(ec.PUD013);
  }

  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD055);
  }

  const expenses: Expense[] = await db.getExpenses(eventId, activeUserId);
  res.status(200).send(expenses);
});

/*
* Get a specific expense
*/
router.get("/expenses/:id", authCheck, async (req, res) => {
  const expenseId = req.params.id;
  if (!isUUID(expenseId)) {
    throw new ErrorExt(ec.PUD056);
  }

  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD055);
  }

  const expense: Expense | null = await db.getExpense(expenseId, activeUserId);
  if (!expense) {
    throw new ErrorExt(ec.PUD084);
  }
  res.status(200).send(expense);
});

/* ---- */
/* POST */
/* ---- */

/*
* Create a new expense
*/
router.post("/expenses", authCheck, async (req, res) => {
  if (!req.body.name || [null, undefined].includes(req.body.amount) || !req.body.categoryId || !req.body.payerId) {
    throw new ErrorExt(ec.PUD057);
  }

  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD055);
  }

  const name: string = req.body.name;
  const description: string | undefined = req.body.description;
  const amount = Number(req.body.amount);
  const categoryId = req.body.categoryId as string;
  const payerId = req.body.payerId as string;
  const expenseDate = req.body.expenseDate ? createDate(req.body.expenseDate) : undefined;

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

  const expense: Expense = await db.createExpense(activeUserId, name, amount, categoryId, payerId, description, expenseDate);
  res.status(200).send(expense);
});

/* --- */
/* PUT */
/* --- */

/*
* Edit (replace) expense
*/
router.put("/expenses/:id", authCheck, async (req, res) => {
  const expenseId = req.params.id;
  if (!isUUID(expenseId)) {
    throw new ErrorExt(ec.PUD056);
  }

  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD055);
  }

  const name: string = req.body.name;
  const description: string | undefined = req.body.description;
  const amount: number = Number(req.body.amount);
  const categoryId: string = req.body.categoryId;
  const payerId: string = req.body.payerId;
  const expenseDate: Date | undefined = req.body.expenseDate ? createDate(req.body.expenseDate) : undefined;

  if (!name || !categoryId || amount === undefined || !payerId) {
    throw new ErrorExt(ec.PUD142);
  }
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

  const data = {
    name: name,
    description: description,
    amount: amount,
    categoryId: categoryId,
    payerId: payerId,
    expenseDate: expenseDate
  };

  const expense = await db.editExpense(expenseId, activeUserId, data);
  if (!expense) {
    throw new ErrorExt(ec.PUD084);
  }
  res.status(200).send(expense);
});

/*
* Edit (patch) expense
*/
router.patch("/expenses/:id", authCheck, async (req, res) => {
  const expenseId = req.params.id;
  if (!isUUID(expenseId)) {
    throw new ErrorExt(ec.PUD056);
  }

  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD055);
  }

  const name: string | undefined = req.body.name;
  const description: string | undefined = req.body.description;
  const amount: number | undefined = req.body.amount !== undefined ? Number(req.body.amount) : undefined;
  const categoryId: string | undefined = req.body.categoryId;
  const payerId: string | undefined = req.body.payerId;
  const expenseDate: Date | undefined = req.body.expenseDate ? createDate(req.body.expenseDate) : undefined;

  if (!name && !categoryId && amount === undefined && !payerId && description === undefined) {
    throw new ErrorExt(ec.PUD116);
  }
  if (categoryId && !isUUID(categoryId)) {
    throw new ErrorExt(ec.PUD045);
  }
  if (payerId && !isUUID(payerId)) {
    throw new ErrorExt(ec.PUD089);
  }
  if (amount !== undefined && isNaN(amount)) {
    throw new ErrorExt(ec.PUD088);
  }
  if (amount && amount < 0) {
    throw new ErrorExt(ec.PUD030);
  }
  if (name?.trim() === "") {
    throw new ErrorExt(ec.PUD059);
  }

  const data = {
    name: name,
    description: description,
    amount: amount,
    categoryId: categoryId,
    payerId: payerId,
    expenseDate: expenseDate
  };

  const expense = await db.patchExpense(expenseId, activeUserId, data);
  if (!expense) {
    throw new ErrorExt(ec.PUD084);
  }
  res.status(200).send(expense);
});

/* ------ */
/* DELETE */
/* ------ */

/*
* Delete an expense
*/
router.delete("/expenses/:id", authCheck, async (req, res) => {
  const expenseId = req.params.id;
  if (!isUUID(expenseId)) {
    throw new ErrorExt(ec.PUD056);
  }
  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD055);
  }

  const success = await db.deleteExpense(expenseId, activeUserId);
  res.status(200).send({ success: success });
});

export default router;
