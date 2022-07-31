import express from "express";
import sql from "mssql";
import { calculatePayments } from "../calculations";
import { parseCategories, parseExpenses } from "../parsers";
import { Category, Expense, User } from "../types";
const router = express.Router();

router.get("/payments", async (req, res, next) => {
  console.log("Payments!");
  if (!req.query.eventId) {
    return res.status(400).send("EventId not provided!");
  }
  let categories: Category[] | undefined;
  let expenses: Expense[] | undefined;

  let request = new sql.Request();
  await request
    .input("event_id", sql.Int, req.query.eventId)
    .execute("get_categories")
    .then( (data) => {
      categories = parseCategories(data.recordset);
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
  console.log("Categories");
  console.log(categories);
  console.log("------------\nExpenses:");
  console.log(expenses);
  console.log("------------");

  if (!categories || !expenses) {
    return res.status(400).send("Something went wrong getting categories or expenses");
  }

  const test = calculatePayments(expenses, categories);
  console.log("Result of Capeo's marvelous function:");
  console.log(test);
  res.send(test || "undefined :(");
});

router.get("/paymentsTest", async (req, res) => {
  console.log("Payments TEST!");
  if (!req.query.eventId) {
    return res.status(400).send("EventId not provided!");
  }

  const user1: User = {
    id: 1,
    name: "Arnt",
    weight: 1
  };
  const user2: User = {
    id: 2,
    name: "Per",
    weight: 1
  };

  const categories: Category[] = [
    {
      id: 1,
      name: "Food",
      users: [user1, user2]
    },
    {
      id: 2,
      name: "Transport",
      users: [user1, user2]
    }
  ];

  const expenses: Expense[] = [
    {
      id: 1,
      name: "Bananer",
      description: "",
      amount: 200,
      categoryId: 1,
      categoryName: "Food",
      payerId: 1,
      payer: "Arnt"
    },
    {
      id: 2,
      name: "Gas gas gas",
      description: "",
      amount: 1000,
      categoryId: 2,
      categoryName: "Transport",
      payerId: 2,
      payer: "Per"
    }
  ];

  console.log("------------");
  console.log("Users:");
  console.log(user1);
  console.log(user2);
  console.log("------------");
  console.log("Categories:");
  console.log(categories);
  console.log("------------");
  console.log("Expenses:");
  console.log(expenses);
  console.log("------------");

  const test = calculatePayments(expenses, categories);
  console.log("Result of Capeo's marvelous function:");
  console.log(test);
  res.send(test || "undefined :(");
});

export default router;