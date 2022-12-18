import express from "express";
import sql from "mssql";
import { calculateBalance } from "../calculations";
import { parseBalance, parseCategories, parseExpenses, parseUsers } from "../parsers";
import { Category, Expense, User, UserBalance } from "../types/types";
import { isEmail } from "../utils/emailValidator";
const router = express.Router();

/* --- */
/* GET */
/* --- */

// Get a list of all users in a given event
router.get("/users", (req, res, next) => {
  const request = new sql.Request();
  request
    .input("event_id", sql.Int, req.query.eventId)
    .execute("get_users")
    .then(data => {
      const users: User[] = parseUsers(data.recordset);
      res.send(users);
    })
    .catch(err => next(err));
});

// Get a list of a user's expenses
router.get("/users/:id/expenses/:event", (req, res, next) => {
  const eventId = Number(req.params.event);
  if (isNaN(eventId)) {
    return res.status(400).json("Event ID must be a number");
  }
  const request = new sql.Request();
  request
    .input("event_id", sql.Int, eventId)
    .input("user_id", sql.Int, req.params.id)
    .execute("get_expenses")
    .then(data => {
      const expenses: Expense[] = parseExpenses(data.recordset);
      res.send(expenses);
    })
    .catch(err => next(err));
});

// Get a list of all users' balance information in an event
router.get("/users/balances", async (req, res, next) => {

  if (!req.query.eventId) {
    return res.status(400).send("EventId not provided!");
  }
  
  const request = new sql.Request();
  const data = await request
    .input("event_id", sql.Int, req.query.eventId)
    .execute("get_event_payment_data")
    .then(res => {
      return res.recordsets as sql.IRecordSet<object>[];
    })
    .catch(err => next(err));

  if (!data || data.length < 3) {
    return res.status(400).send("Something went wrong getting users, categories or expenses");
  }

  const users: User[] = parseUsers(data[0]);
  const categories: Category[] = parseCategories(data[1], "calc");
  const expenses: Expense[] = parseExpenses(data[2]);

  const balance = calculateBalance(expenses, categories, users);
  const usersWithBalance: UserBalance[] = parseBalance(users, balance);
  res.send(usersWithBalance);
});

/* ---- */
/* POST */
/* ---- */

// Create a new user
router.post("/users", (req, res, next) => {
  if (!req.body.name || !req.body.eventId || !req.body.password) {
    return res.status(400).send("Name, password or eventId not provided");
  }

  // Validate email
  if (!isEmail(req.body.email)) {
    return res.status(400).send("Not a valid email");
  }

  const request = new sql.Request();
  request
    .input("username", sql.NVarChar, req.body.name)
    .input("event_id", sql.Int, req.body.eventId)
    .input("email", sql.NVarChar, req.body.email)
    .input("password", sql.NVarChar, req.body.password)
    .execute("new_user")
    .then(data => {
      const users: User[] = parseUsers(data.recordset);
      res.send(users[0]);
    })
    .catch(err => next(err));
});

/* --- */
/* PUT */
/* --- */

// Edit user (rename),
router.put("/users/:id", (req, res, next) => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).send("User ID must be a number!");
  }
  if (!req.body.name) {
    return res.status(400).send("Name not provided!");
  }
  const request = new sql.Request();
  request
    .input("user_id", sql.Int, userId)
    .input("username", sql.NVarChar, req.body.name)
    .execute("edit_user")
    .then(() => {
      res.send({});
    })
    .catch(err => next(err));
});

/* ------ */
/* DELETE */
/* ------ */

// Delete a user
router.delete("/users/:id", (req, res, next) => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).send("User ID must be a number!");
  }
  const request = new sql.Request();
  request
    .input("user_id", sql.Int, userId)
    .execute("delete_user")
    .then(() => {
      res.send({});
    })
    .catch(err => next(err));
});

export default router;
