import express from "express";
import sql from "mssql";
import { calculatePayments } from "../calculations";
import { parseCategories, parseExpenses, parseUsers } from "../parsers";
import { Category, Expense, User } from "../types";
const router = express.Router();

router.get("/payments", async (req, res, next) => {
  if (!req.query.eventId) {
    return res.status(400).send("EventId not provided!");
  }

  let users: User[] | undefined;
  let categories: Category[] | undefined;
  let expenses: Expense[] | undefined;

  let request = new sql.Request();
  await request
    .input("event_id", sql.Int, req.query.eventId)
    .execute("get_users")
    .then( (data) => {
      users = parseUsers(data.recordset);
    })
    .catch(next);

  request = new sql.Request();
  await request
    .input("event_id", sql.Int, req.query.eventId)
    .input("category_id", sql.Int, null)
    .execute("get_categories")
    .then( (data) => {
      categories = parseCategories(data.recordset, "calc");
    })
    .catch(next);

  request = new sql.Request();
  await request
    .input("event_id", sql.Int, req.query.eventId)
    .execute("get_expenses")
    .then( (data) => {
      expenses = parseExpenses(data.recordset);
    })
    .catch(next);

  console.log("------------");
  console.log("Users:");
  console.log(users);
  console.log("------------");
  console.log("Categories:");
  console.log(categories);
  console.log("------------");
  console.log("Expenses:");
  console.log(expenses);
  console.log("------------");

  if (!users || !categories || !expenses) {
    return res.status(400).send("Something went wrong getting users, categories or expenses");
  }

  const payments = calculatePayments(expenses, categories, users);
  res.send(payments);
});

export default router;