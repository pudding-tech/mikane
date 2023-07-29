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
import { isPhoneNumber } from "../utils/phoneValidator";
import { sendRegisterAccountEmail } from "../email-services/registerAccount";
import { sendDeleteAccountEmail } from "../email-services/deleteAccount";
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
router.get("/verifykey/register/:key", async (req, res, next) => {
  try {
    const key = req.params.key;
    const email = await db.verifyRegisterAccountKey(key);
    if (!email) {
      throw new ErrorExt(ec.PUD101);
    }
    res.status(200).json({ email: email });
  }
  catch (err) {
    next(err);
  }
});

/*
* Verify that a delete account key is valid
*/
router.get("/verifykey/deleteaccount/:key", authCheck, async (req, res, next) => {
  try {
    const key = req.params.key;
    const valid = await db.verifyDeleteAccountKey(key);
    if (!valid) {
      throw new ErrorExt(ec.PUD106);
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
    const username: string = req.body.username;
    const firstName: string = req.body.firstName;
    const lastName: string = req.body.lastName;
    const email: string = req.body.email;
    const phoneNumber: string = req.body.phone;
    const password: string = req.body.password;

    if (!username || !firstName || !email || !phoneNumber || !password) {
      throw new ErrorExt(ec.PUD052);
    }
    if (username.trim() === "" || firstName.trim() === "" || email.trim() === "" || phoneNumber.trim() === "" || password.trim() === "") {
      throw new ErrorExt(ec.PUD059);
    }

    // Validate email and phone number
    if (!isEmail(email)) {
      throw new ErrorExt(ec.PUD004);
    }
    if (!isPhoneNumber(phoneNumber)) {
      throw new ErrorExt(ec.PUD113);
    }

    const hash = createHash(password);
    const user: User = await db.createUser(username.trim(), firstName.trim(), lastName.trim(), email.trim(), phoneNumber.trim(), hash);
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

/*
* Request an account deletion confirmation email
*/
router.post("/users/requestdeleteaccount", authCheck, async (req, res, next) => {
  try {
    if (!env.MIKANE_EMAIL || !env.MIKANE_EMAIL_PASSWORD) {
      throw new ErrorExt(ec.PUD073);
    }

    const user: User | null = await db.getUser(req.session.userId ?? "");
    if (!user || !user.email) {
      throw new ErrorExt(ec.PUD054);
    }

    const key = generateKey();
    await db.newDeleteAccountKey(user.id, key);
    await sendDeleteAccountEmail(user.email, key);
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

    const username: string | undefined = req.body.username;
    const firstName: string | undefined = req.body.firstName;
    const lastName: string | undefined = req.body.lastName;
    const email: string | undefined = req.body.email;
    const phoneNumber: string | undefined = req.body.phone;

    if (!username && !firstName && !lastName && !email && !phoneNumber) {
      throw new ErrorExt(ec.PUD058);
    }
    if (username?.trim() === "" || firstName?.trim() === "" || email?.trim() === "" || phoneNumber?.trim() === "") {
      throw new ErrorExt(ec.PUD059);
    }

    // Validate email and phone number
    if (email && !isEmail(email)) {
      throw new ErrorExt(ec.PUD004);
    }
    if (phoneNumber && !isPhoneNumber(phoneNumber)) {
      throw new ErrorExt(ec.PUD113);
    }
    
    const data = {
      username: username,
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phoneNumber
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
    const key: string = req.body.key;
    const userId = req.params.id;
    if (!isUUID(userId)) {
      throw new ErrorExt(ec.PUD016);
    }

    const valid = await db.verifyDeleteAccountKey(key);
    if (!valid) {
      throw new ErrorExt(ec.PUD106);
    }

    const success = await db.deleteUser(userId, key);

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
