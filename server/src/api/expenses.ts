import express from "express";
import * as db from "../db/dbExpenses.ts";
import { authCheck } from "../middlewares/authCheck.ts";
import { csrfCheck } from "../middlewares/csrf.ts";
import { useRateLimit } from "../middlewares/rateLimiter.ts";
import { createDate } from "../utils/dateCreator.ts";
import { isUUID } from "../utils/validators/uuidValidator.ts";
import { Expense } from "../types/types.ts";
import { PudError } from "../types/errors.ts";
import * as ec from "../types/errorCodes.ts";
const router = express.Router();

/* --- */
/* GET */
/* --- */

/*
* Get a list of all expenses for a given event
*/
router.get("/expenses", useRateLimit(), authCheck, csrfCheck, async (req, res) => {
  const eventId = req.query.eventId as string;
  if (!isUUID(eventId)) {
    throw new PudError(ec.PUD013);
  }

  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new PudError(ec.PUD055);
  }

  const expenses: Expense[] = await db.getExpenses(eventId, activeUserId);
  res.status(200).send(expenses);
});

/*
* Get a specific expense
*/
router.get("/expenses/:id", useRateLimit(), authCheck, csrfCheck, async (req, res) => {
  const expenseId = req.params.id;
  if (!isUUID(expenseId)) {
    throw new PudError(ec.PUD056);
  }

  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new PudError(ec.PUD055);
  }

  const expense: Expense | null = await db.getExpense(expenseId, activeUserId);
  if (!expense) {
    throw new PudError(ec.PUD084);
  }
  res.status(200).send(expense);
});

/* ---- */
/* POST */
/* ---- */

/*
* Create a new expense
*/
router.post("/expenses", useRateLimit(), authCheck, csrfCheck, async (req, res) => {
  if (!req.body.name || [null, undefined].includes(req.body.amount) || !req.body.categoryId || !req.body.payerId) {
    throw new PudError(ec.PUD057);
  }

  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new PudError(ec.PUD055);
  }

  const name: string = req.body.name;
  const description: string | null | undefined = req.body.description;
  const amount = Number(req.body.amount);
  const categoryId = req.body.categoryId as string;
  const payerId = req.body.payerId as string;
  const currency: string | null | undefined = req.body.currency;
  const expenseDate: Date | null | undefined = req.body.expenseDate === null
    ? null
    : req.body.expenseDate === undefined
      ? undefined
      : createDate(req.body.expenseDate);

  if (!isUUID(categoryId)) {
    throw new PudError(ec.PUD045);
  }
  if (!isUUID(payerId)) {
    throw new PudError(ec.PUD089);
  }
  if (isNaN(amount)) {
    throw new PudError(ec.PUD088);
  }
  if (amount < 0) {
    throw new PudError(ec.PUD030);
  }
  if (name.trim() === "") {
    throw new PudError(ec.PUD059);
  }

  const expense: Expense = await db.createExpense(activeUserId, name, amount, categoryId, payerId, description, currency, expenseDate);
  res.status(200).send(expense);
});

/* --- */
/* PUT */
/* --- */

/*
* Edit expense (replace)
*/
router.put("/expenses/:id", useRateLimit(), authCheck, csrfCheck, async (req, res) => {
  const expenseId = req.params.id;
  if (!isUUID(expenseId)) {
    throw new PudError(ec.PUD056);
  }

  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new PudError(ec.PUD055);
  }

  const name: string = req.body.name;
  const description: string | null | undefined = req.body.description;
  const amount: number = Number(req.body.amount);
  const categoryId: string = req.body.categoryId;
  const payerId: string = req.body.payerId;
  const currency: string | null | undefined = req.body.currency;
  const expenseDate: Date | null | undefined = req.body.expenseDate === null
    ? null
    : req.body.expenseDate === undefined
      ? undefined
      : createDate(req.body.expenseDate);

  if (!name || !categoryId || amount === undefined || !payerId) {
    throw new PudError(ec.PUD142);
  }
  if (!isUUID(categoryId)) {
    throw new PudError(ec.PUD045);
  }
  if (!isUUID(payerId)) {
    throw new PudError(ec.PUD089);
  }
  if (isNaN(amount)) {
    throw new PudError(ec.PUD088);
  }
  if (amount < 0) {
    throw new PudError(ec.PUD030);
  }
  if (name.trim() === "") {
    throw new PudError(ec.PUD059);
  }

  const data = {
    name: name,
    description: description,
    amount: amount,
    categoryId: categoryId,
    payerId: payerId,
    currency: currency,
    expenseDate: expenseDate
  };

  const expense = await db.editExpense(expenseId, activeUserId, data);
  if (!expense) {
    throw new PudError(ec.PUD084);
  }
  res.status(200).send(expense);
});

/* ----- */
/* PATCH */
/* ----- */

/*
* Edit expense (selectively)
*/
router.patch("/expenses/:id", useRateLimit(), authCheck, csrfCheck, async (req, res) => {
  const expenseId = req.params.id;
  if (!isUUID(expenseId)) {
    throw new PudError(ec.PUD056);
  }

  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new PudError(ec.PUD055);
  }

  const hasDescription = Object.prototype.hasOwnProperty.call(req.body, "description");
  const hasCurrency = Object.prototype.hasOwnProperty.call(req.body, "currency");
  const hasExpenseDate = Object.prototype.hasOwnProperty.call(req.body, "expenseDate");

  const name: string | undefined = req.body.name;
  const description: string | null | undefined = req.body.description;
  const amount: number | undefined = req.body.amount !== undefined ? Number(req.body.amount) : undefined;
  const categoryId: string | undefined = req.body.categoryId;
  const payerId: string | undefined = req.body.payerId;
  const currency: string | null | undefined = req.body.currency;
  const expenseDate: Date | null | undefined = !hasExpenseDate ? undefined : (req.body.expenseDate === null ? null : createDate(req.body.expenseDate));

  if (!name && !categoryId && amount === undefined && !payerId && !hasDescription && !hasCurrency && !hasExpenseDate) {
    throw new PudError(ec.PUD116);
  }
  if (categoryId && !isUUID(categoryId)) {
    throw new PudError(ec.PUD045);
  }
  if (payerId && !isUUID(payerId)) {
    throw new PudError(ec.PUD089);
  }
  if (amount !== undefined && isNaN(amount)) {
    throw new PudError(ec.PUD088);
  }
  if (amount !== undefined && amount < 0) {
    throw new PudError(ec.PUD030);
  }
  if (name?.trim() === "") {
    throw new PudError(ec.PUD059);
  }

  const data = {
    name: name,
    description: description,
    descriptionIsSet: hasDescription,
    amount: amount,
    categoryId: categoryId,
    payerId: payerId,
    currency: currency,
    currencyIsSet: hasCurrency,
    expenseDate: expenseDate,
    expenseDateIsSet: hasExpenseDate
  };

  const expense = await db.patchExpense(expenseId, activeUserId, data);
  if (!expense) {
    throw new PudError(ec.PUD084);
  }
  res.status(200).send(expense);
});

/* ------ */
/* DELETE */
/* ------ */

/*
* Delete an expense
*/
router.delete("/expenses/:id", useRateLimit(), authCheck, csrfCheck, async (req, res) => {
  const expenseId = req.params.id;
  if (!isUUID(expenseId)) {
    throw new PudError(ec.PUD056);
  }
  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new PudError(ec.PUD055);
  }

  const success = await db.deleteExpense(expenseId, activeUserId);
  res.status(200).send({ success: success });
});

export default router;
