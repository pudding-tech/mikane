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
  let users: User[] | undefined;
  let categories: Category[] | undefined;
  let expenses: Expense[] | undefined;

  let request = new sql.Request();
  await request
    .input("event_id", sql.Int, req.query.eventId)
    .execute("get_users")
    .then( (data) => {
      users = data.recordset;
    })
    .catch(next);

  request = new sql.Request();
  await request
    .input("event_id", sql.Int, req.query.eventId)
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
  console.log("Categories");
  console.log(categories);
  console.log("------------\nExpenses:");
  console.log(expenses);
  console.log("------------");

  if (!categories || !expenses) {
    return res.status(400).send("Something went wrong getting categories or expenses");
  }

  const payments = calculatePayments(expenses, categories);
  console.log("Result of Capeo's marvelous function:");
  res.send(payments["payments"]);
});

router.get("/paymentsTest", async (req, res) => {
  console.log("Payments TEST!");

  const user1: User = {
    id: 1,
    name: "Arnt"
  };
  const user2: User = {
    id: 2,
    name: "Per"
  };

  const categories: Category[] = [
    {
      id: 1,
      name: "Board games",
      userWeights: new Map<User, number>([ [user1, 1], [user2, 1] ])
    }
  ];

  const expenses: Expense[] = [
    {
      id: 1,
      name: "Scam lamps",
      description: "",
      amount: 500,
      categoryId: 1,
      categoryName: "Board games",
      payerId: 2,
      payer: "Per"
    }
  ];

  console.log("------------");
  console.log("Categories:");
  console.log(categories);
  console.log("------------");
  console.log("Expenses:");
  console.log(expenses);
  console.log("------------");

  //const test = calculatePayments(expenses, categories);
  //console.log("Result of Capeo's marvelous function:");
  //console.log(test);
  res.send("Yes");
  //res.send(test || "undefined :(");
});

export default router;