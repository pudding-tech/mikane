import express from "express";
import sql from "mssql";
import { calculateBalance } from "../calculations";
import { parseBalance, parseCategories, parseExpenses, parseUsers } from "../parsers";
import { Category, Expense, User } from "../types";
const router = express.Router();

router.get("/users", (req, res, next) => {
  const request = new sql.Request();
  request
    .input("event_id", sql.Int, req.query.eventId)
    .execute("get_users")
    .then( (data) => {
      const users: User[] = parseUsers(data.recordset);
      res.send(users);
    })
    .catch(next);
});

router.post("/users", (req, res, next) => {
  if (!req.body.name || !req.body.eventId) {
    return res.status(400).send("Name or eventId not provided!");
  }
  const request = new sql.Request();
  request
    .input("name", sql.NVarChar, req.body.name)
    .input("event_id", sql.Int, req.body.eventId)
    .execute("new_user")
    .then( (data) => {
      const users: User[] = parseUsers(data.recordset);
      res.send(users[0]);
    })
    .catch(next);
});

router.delete("/users", (req, res, next) => {
  if (!req.body.userId) {
    return res.status(400).send("User ID not provided!");
  }
  const request = new sql.Request();
  request
    .input("user_id", sql.Int, req.body.userId)
    .execute("delete_user")
    .then( () => {
      res.send({});
    })
    .catch(next);
});

router.get("/users/:id/expenses", (req, res, next) => {
  const request = new sql.Request();
  request
    .input("user_id", sql.Int, req.params.id)
    .execute("get_user_expenses")
    .then( (data) => {
      const expenses: Expense[] = parseExpenses(data.recordset);
      res.send(expenses);
    })
    .catch(next);
});

router.get("/users/balances", async (req, res, next) => {

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
      console.log(data.recordset);
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

  if (!users || !categories || !expenses) {
    return res.status(400).send("Something went wrong getting users, categories or expenses");
  }

  const balance = calculateBalance(expenses, categories, users);
  const userBalance = parseBalance(balance);
  res.send(userBalance);
});

export default router;