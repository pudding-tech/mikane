import express from "express";
import * as db from "../db/dbUsers";
import * as dbAuth from "../db/dbAuthentication";
import { authCheck } from "../middlewares/authCheck";
import { authenticate, createHash } from "../utils/auth";
import { isEmail } from "../utils/emailValidator";
import { Expense, User } from "../types/types";
import * as ec from "../types/errorCodes";
const router = express.Router();

/* --- */
/* GET */
/* --- */

/*
* Get a list of all users in a given event
*/
router.get("/users", authCheck, async (req, res, next) => {
  const filter: { eventId?: number, excludeUserId?: number } = {
    eventId: req.query.eventId ? Number(req.query.eventId) : undefined
  };

  const excludeSelf = req.query.exclude === "self";
  if (excludeSelf) {
    filter.excludeUserId = Number(req.session.userId);
  }

  try {
    const users: User[] = await db.getUsers(filter);
    res.status(200).send(users);
  }
  catch (err) {
    next(err);
  }
});

/*
* Get a specific user
*/
router.get("/users/:id", authCheck, async (req, res, next) => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    return res.status(ec.PUD016.status).json(ec.PUD016);
  }
  try {
    const user: User | null = await db.getUser(userId);
    res.status(200).send(user);
  }
  catch (err) {
    next(err);
  }
});

/*
* Get a list of a user's expenses
*/
router.get("/users/:id/expenses/:eventId", authCheck, async (req, res, next) => {
  const userId = Number(req.params.id);
  const eventId = Number(req.params.eventId);
  if (isNaN(userId) || isNaN(eventId)) {
    return res.status(ec.PUD015.status).json(ec.PUD015);
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
    return res.status(ec.PUD052.status).json(ec.PUD052);
  }
  if (req.body.username.trim() === "" || req.body.firstName.trim() === "" || req.body.email.trim() === "" || req.body.phone.trim() === "" || req.body.password.trim() === "") {
    return res.status(ec.PUD059.status).json(ec.PUD059);
  }

  // Validate email
  if (!isEmail(req.body.email)) {
    return res.status(ec.PUD004.status).json(ec.PUD004);
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

/*
* Change signed in user's password
*/
router.post("/users/changepassword", authCheck, async (req, res, next) => {
  try {
    // Get signed in user's hashed password
    const userId = req.session.userId;
    const userPW = await dbAuth.getUserHash(undefined, userId);
    if (!userPW || !userPW.hash || !userId) {
      return res.status(ec.PUD080.status).json(ec.PUD080);
    }

    // Validate current password
    const isAuthenticated = authenticate(req.body.currentPassword ?? "", userPW.hash);
    if (!isAuthenticated) {
      return res.status(ec.PUD081.status).json(ec.PUD081);
    }

    // Validate new password
    const newPassword: string = req.body.newPassword;
    if (!newPassword || newPassword.trim() === "") {
      return res.status(ec.PUD079.status).json(ec.PUD079);
    }

    // Change password
    const hash = createHash(newPassword);
    await db.changePassword(userId, hash);
    
    // Destroy all sessions for this user
    req.sessionStore.destroyAll(userId, err => {
      if (err) {
        console.log(err);
        return res.status(ec.PUD083.status).json(ec.PUD083);
      }
    });

    res.status(200).json({ message: "Password successfully changed" });
  }
  catch (err) {
    next(err);
  }
});

/* --- */
/* PUT */
/* --- */

/*
* Edit user
*/
router.put("/users/:id", authCheck, async (req, res, next) => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    return res.status(ec.PUD016.status).json(ec.PUD016);
  }
  if (!req.body.username && !req.body.firstName && !req.body.lastName && !req.body.email && !req.body.phone) {
    return res.status(ec.PUD058.status).json(ec.PUD058);
  }
  if (req.body.username?.trim() === "" || req.body.firstName?.trim() === "" || req.body.email?.trim() === "" || req.body.phone?.trim() === "") {
    return res.status(ec.PUD059.status).json(ec.PUD059);
  }
  const data = {
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone
  };
  try {
    const user: User = await db.editUser(userId, data);
    res.status(200).send(user);
  }
  catch (err) {
    next(err);
  }
});

/* ------ */
/* DELETE */
/* ------ */

/*
* Delete user
*/
router.delete("/users/:id", authCheck, async (req, res, next) => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    return res.status(ec.PUD016.status).json(ec.PUD016);
  }
  try {
    const success = await db.deleteUser(userId);

    // Delete current session if deleted user is logged in
    if (req.session.authenticated && req.session.userId === userId) {
      const username = req.session.username;
      req.session.destroy(err => {
        if (err) {
          console.log(err);
          return res.status(ec.PUD060.status).json(ec.PUD060);
        }
        console.log(`User ${username} successfully signed out`);
      });
    }

    res.status(200).send({ success: success });
  }
  catch (err) {
    next(err);
  }
});

export default router;
