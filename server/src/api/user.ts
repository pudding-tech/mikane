import express from "express";
import sql from "mssql";
import { parseExpenses, parseUsers } from "../parsers";
import { Expense, User } from "../types";
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

router.get("/users/:id/expenses", (req, res, next) => {
  const request = new sql.Request();
  request
    .input("event_id", sql.Int, req.query.eventId)
    .execute("get_user_expenses")
    .then( (data) => {
      const expenses: Expense[] = parseExpenses(data.recordset);
      res.send(expenses);
    })
    .catch(next);
});

export default router;