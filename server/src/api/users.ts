import express from "express";
import * as db from "../db/dbUsers";
import { checkAuth } from "../middleware/authMiddleware";
import { createHash } from "../utils/auth";
import { isEmail } from "../utils/emailValidator";
import { PUD004 } from "../utils/errorCodes";
import { Expense, User } from "../types/types";
const router = express.Router();

/* --- */
/* GET */
/* --- */

// Get a list of all users in a given event
router.get("/users", checkAuth, async (req, res, next) => {
  try {
    const users: User[] = await db.getUsers(Number(req.query.eventId));
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
    return res.status(400).json({ error: "User ID must be a number" });
  }
  try {
    const user: User = await db.getUser(userId);
    res.status(200).send(user);
  }
  catch (err) {
    next(err);
  }
});

// Get a list of a user's expenses
router.get("/users/:id/expenses/:event", checkAuth, async (req, res, next) => {
  const userId = Number(req.params.id);
  const eventId = Number(req.params.event);
  if (isNaN(userId) || isNaN(eventId)) {
    return res.status(400).json({ error: "User ID and event ID must be numbers" });
  }
  try {
    const expenses: Expense[] = await db.getUserExpenses(userId, eventId);
    res.status(200).send(expenses);
  }
  catch (err) {
    next(err);
  }
});

/* ---- */
/* POST */
/* ---- */

/*
* Register a new user
*/
router.post("/users", async (req, res, next) => {
  if (!req.body.username || !req.body.firstName || !req.body.email || !req.body.phone || !req.body.password) {
    return res.status(400).json({ error: "Name, first name, phone number or password not provided" });
  }

  // Validate email
  if (!isEmail(req.body.email)) {
    return res.status(400).json(PUD004);
  }

  try {
    const hash = createHash(req.body.password);
    const user: User = await db.createUser(req.body.username, req.body.firstName, req.body.lastName, req.body.email, req.body.phone, hash);
    res.status(200).send(user);
  }
  catch (err) {
    next(err);
  }
});

/* --- */
/* PUT */
/* --- */

// Edit user (rename),
router.put("/users/:id", checkAuth, async (req, res, next) => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json({ error: "User ID must be a number" });
  }
  if (!req.body.name) {
    return res.status(400).json({ error: "Name not provided" });
  }
  try {
    const user: User = await db.editUser(userId, req.body.name);
    res.status(200).send(user);
  }
  catch (err) {
    next(err);
  }
});

/* ------ */
/* DELETE */
/* ------ */

// Delete a user
router.delete("/users/:id", checkAuth, async (req, res, next) => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json({ error: "User ID must be a number" });
  }
  try {
    const success = await db.deleteUser(userId);
    res.status(200).send(success);
  }
  catch (err) {
    next(err);
  }
});

export default router;
