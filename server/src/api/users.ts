import express from "express";
import env from "../env";
import * as db from "../db/dbUsers";
import * as dbAuth from "../db/dbAuthentication";
import * as ec from "../types/errorCodes";
import { authCheck } from "../middlewares/authCheck";
import { authenticate, createHash } from "../utils/auth";
import { generateKey } from "../utils/generateKey";
import { isUUID } from "../utils/uuidValidator";
import { isEmail } from "../utils/emailValidator";
import { sendRegisterAccountEmail } from "../email-services/registerAccount";
import { Expense, User } from "../types/types";
import { ErrorExt } from "../types/errorExt";
const router = express.Router();

/* --- */
/* GET */
/* --- */

/*
* Get a list of all users in a given event
*/
router.get("/users", authCheck, async (req, res, next) => {
  try {
    const filter: { eventId?: string, excludeUserId?: string } = {
      eventId: req.query.eventId as string
    };

    if (filter.eventId && !isUUID(filter.eventId)) {
      throw new ErrorExt(ec.PUD013);
    }

    const excludeSelf = req.query.exclude === "self";
    if (excludeSelf) {
      filter.excludeUserId = req.session.userId;
    }

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
  try {
    const userId = req.params.id;
    if (!isUUID(userId)) {
      throw new ErrorExt(ec.PUD016);
    }

    const user = await db.getUser(userId);
    if (!user) {
      throw new ErrorExt(ec.PUD008);
    }
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
  try {
    const userId = req.params.id;
    const eventId = req.params.eventId;
    if (!isUUID(userId) || !isUUID(eventId)) {
      throw new ErrorExt(ec.PUD015);
    }

    const expenses: Expense[] = await db.getUserExpenses(userId, eventId);
    res.status(200).send(expenses);
  }
  catch (err) {
    next(err);
  }
});

/*
* Verify that a register account key is valid
*/
router.get("/verifyregisteraccount/:key", async (req, res, next) => {
  try {
    const key = req.params.key;
    const valid = await db.verifyRegisterAccountKey(key);
    if (!valid) {
      throw new ErrorExt(ec.PUD101);
    }
    res.status(200).json();
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
  try {
    if (env.IN_PROD) {
      const key: string = req.body.key;
      const valid = await db.verifyRegisterAccountKey(key);
      if (!valid) {
        throw new ErrorExt(ec.PUD101);
      }
    }

    if (!req.body.username || !req.body.firstName || !req.body.email || !req.body.phone || !req.body.password) {
      throw new ErrorExt(ec.PUD052);
    }
    if (req.body.username.trim() === "" || req.body.firstName.trim() === "" || req.body.email.trim() === "" || req.body.phone.trim() === "" || req.body.password.trim() === "") {
      throw new ErrorExt(ec.PUD059);
    }

    // Validate email
    if (!isEmail(req.body.email)) {
      throw new ErrorExt(ec.PUD004);
    }

    const hash = createHash(req.body.password);
    const user: User = await db.createUser(req.body.username, req.body.firstName, req.body.lastName, req.body.email, req.body.phone, hash);
    if (env.IN_PROD) {
      await db.invalidateRegisterAccountKey(req.body.key as string);
    }
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
      throw new ErrorExt(ec.PUD080);
    }

    // Validate current password
    const isAuthenticated = authenticate(req.body.currentPassword ?? "", userPW.hash);
    if (!isAuthenticated) {
      throw new ErrorExt(ec.PUD081);
    }

    // Validate new password
    const newPassword: string = req.body.newPassword;
    if (!newPassword || newPassword.trim() === "") {
      throw new ErrorExt(ec.PUD079);
    }

    // Change password
    const hash = createHash(newPassword);
    await db.changePassword(userId, hash);

    // Destroy all sessions for this user
    req.sessionStore.destroyAll(userId, err => {
      if (err) {
        throw new ErrorExt(ec.PUD083);
      }
    });

    res.status(200).json({ message: "Password successfully changed" });
  }
  catch (err) {
    next(err);
  }
});

/*
* Invite a new user via email
*/
router.post("/users/invite", authCheck, async (req, res, next) => {
  try {
    if (!env.MIKANE_EMAIL || !env.MIKANE_EMAIL_PASSWORD) {
      throw new ErrorExt(ec.PUD073);
    }

    const email = req.body.email as string;
    if (!email) {
      throw new ErrorExt(ec.PUD072);
    }

    // Validate email
    if (!isEmail(email)) {
      throw new ErrorExt(ec.PUD004);
    }

    const user: User | null = await db.getUser(req.session.userId ?? "");
    if (!user) {
      throw new ErrorExt(ec.PUD054);
    }

    const key = generateKey();
    await db.newRegisterAccountKey(email, key);
    await sendRegisterAccountEmail(email, key, user);
    res.status(200).json({ message: "Email successfully sent" });
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
  try {
    const userId = req.params.id;
    if (!isUUID(userId)) {
      throw new ErrorExt(ec.PUD016);
    }
    if (!req.body.username && !req.body.firstName && !req.body.lastName && !req.body.email && !req.body.phone) {
      throw new ErrorExt(ec.PUD058);
    }
    if (req.body.username?.trim() === "" || req.body.firstName?.trim() === "" || req.body.email?.trim() === "" || req.body.phone?.trim() === "") {
      throw new ErrorExt(ec.PUD059);
    }
    const data = {
      username: req.body.username as string | undefined,
      firstName: req.body.firstName as string | undefined,
      lastName: req.body.lastName as string | undefined,
      email: req.body.email as string | undefined,
      phone: req.body.phone as string | undefined
    };

    const user = await db.editUser(userId, data);
    if (!user) {
      throw new ErrorExt(ec.PUD008);
    }
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
  try {
    const userId = req.params.id;
    if (!isUUID(userId)) {
      throw new ErrorExt(ec.PUD016);
    }

    const success = await db.deleteUser(userId);

    // Delete current session if deleted user is logged in
    if (req.session.authenticated && req.session.userId === userId) {
      const username = req.session.username;
      req.session.destroy(err => {
        if (err) {
          throw new ErrorExt(ec.PUD060, err);
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
