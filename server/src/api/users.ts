import express from "express";
import sql from "mssql";
import { getUsers, getUser } from "../db/dbUsers";
import { checkAuth } from "../middleware/authMiddleware";
import { parseExpenses, parseUsers } from "../parsers";
import { createHash } from "../utils/auth";
import { isEmail } from "../utils/emailValidator";
import { Expense, User } from "../types/types";
import { PUD004 } from "../utils/errorCodes";
const router = express.Router();

/* --- */
/* GET */
/* --- */

// Get a list of all users in a given event
router.get("/users", checkAuth, async (req, res, next) => {
  try {
    const users = await getUsers(Number(req.query.eventId));
    res.status(200).send(users);
  }
  catch (err) {
    next(err);
  }
});

// Get a specific user
router.get("/users/:id", checkAuth, async (req, res, next) => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json("User ID must be a number");
  }
  try {
    const user = await getUser(userId);
    res.status(200).send(user);
  }
  catch (err) {
    next(err);
  }
});

// Get a list of a user's expenses
router.get("/users/:id/expenses/:event", checkAuth, (req, res, next) => {
  const userId = Number(req.params.id);
  const eventId = Number(req.params.event);
  if (isNaN(userId) || isNaN(eventId)) {
    return res.status(400).json("User ID and event ID must be numbers");
  }
  const request = new sql.Request();
  request
    .input("event_id", sql.Int, eventId)
    .input("user_id", sql.Int, userId)
    .execute("get_expenses")
    .then(data => {
      const expenses: Expense[] = parseExpenses(data.recordset);
      res.send(expenses);
    })
    .catch(err => next(err));
});

/* ---- */
/* POST */
/* ---- */

/*
* Register a new user
*/
router.post("/users", async (req, res, next) => {
  if (!req.body.username || !req.body.firstName || !req.body.phone || !req.body.password) {
    return res.status(400).json("Name, first name, phone number or password not provided");
  }

  // Validate email
  if (!isEmail(req.body.email)) {
    return res.status(400).json(PUD004);
  }

  const hash = createHash(req.body.password);
  
  const request = new sql.Request();
  const user = await request
    .input("username", sql.NVarChar, req.body.username)
    .input("first_name", sql.NVarChar, req.body.firstName)
    .input("last_name", sql.NVarChar, req.body.lastName)
    .input("email", sql.NVarChar, req.body.email)
    .input("password", sql.NVarChar, hash)
    .execute("new_user")
    .then(res => {
      const users: User[] = parseUsers(res.recordset);
      return users[0];
    })
    .catch(err => next(err));

  res.send(user);
});

/* --- */
/* PUT */
/* --- */

// Edit user (rename),
router.put("/users/:id", checkAuth, (req, res, next) => {
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
router.delete("/users/:id", checkAuth, (req, res, next) => {
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
