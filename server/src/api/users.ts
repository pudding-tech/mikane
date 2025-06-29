import express from "express";
import env from "../env";
import * as db from "../db/dbUsers";
import * as dbAuth from "../db/dbAuthentication";
import * as ec from "../types/errorCodes";
import { authCheck } from "../middlewares/authCheck";
import { authenticate, createHash } from "../utils/auth";
import { generateKey } from "../utils/generateKey";
import { isUUID } from "../utils/validators/uuidValidator";
import { isEmail } from "../utils/validators/emailValidator";
import { isPhoneNumber } from "../utils/validators/phoneValidator";
import { isValidPassword } from "../utils/validators/passwordValidator";
import { isValidUsername } from "../utils/validators/usernameValidator";
import { removeUserInfo } from "../parsers/parseUserInfo";
import { sendRegisterAccountEmail } from "../email-services/registerAccount";
import { sendDeleteAccountEmail } from "../email-services/deleteAccount";
import { Event, Expense, User } from "../types/types";
import { ErrorExt } from "../types/errorExt";
const router = express.Router();

/* --- */
/* GET */
/* --- */

/*
* Get a list of all users in a given event
*/
router.get("/users", authCheck, async (req, res) => {
  const filter: { eventId?: string, excludeGuests?: boolean, excludeUserId?: string } = {
    eventId: req.query.eventId as string,
    excludeGuests: req.query.excludeGuests === "true"
  };

  if (filter.eventId !== undefined && !isUUID(filter.eventId)) {
    throw new ErrorExt(ec.PUD013);
  }

  const excludeSelf = req.query.excludeSelf === "true";
  if (excludeSelf) {
    filter.excludeUserId = req.session.userId;
  }

  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD055);
  }

  const users: User[] = await db.getUsers(activeUserId, filter);

  // Remove sensitive information if users are not signed in user
  removeUserInfo(users, req.session.userId ?? "");

  res.status(200).send(users);
});

/*
* Get a specific user
*/
router.get("/users/:id", authCheck, async (req, res) => {
  const userId = req.params.id;
  const activeUserId = req.session.userId;
  if (!isUUID(userId)) {
    throw new ErrorExt(ec.PUD016);
  }
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD054);
  }

  const user = await db.getUser(userId);
  if (!user) {
    throw new ErrorExt(ec.PUD008);
  }

  // Remove sensitive information if user is not signed in user
  removeUserInfo([user], activeUserId);

  res.status(200).send(user);
});

/*
* Get a specific user by username (also accepts ID)
*/
router.get("/users/username/:usernameOrUserId", authCheck, async (req, res) => {
  const usernameOrUserId = req.params.usernameOrUserId;
  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD054);
  }

  let user: User | null;
  if (isUUID(usernameOrUserId)) {
    user = await db.getUser(usernameOrUserId, 280);
  }
  else {
    user = await db.getUser(null, 280, usernameOrUserId);
  }

  if (!user) {
    throw new ErrorExt(ec.PUD008);
  }

  // Remove sensitive information if user is not signed in user
  removeUserInfo([user], activeUserId);

  res.status(200).send(user);
});

/*
* Get a list of a user's events
*/
router.get("/users/:id/events", authCheck, async (req, res) => {
  const userId = req.params.id;
  if (!isUUID(userId)) {
    throw new ErrorExt(ec.PUD016);
  }

  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD055);
  }

  const filter: { limit?: number, offset?: number } = {
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    offset: req.query.offset ? Number(req.query.offset) : undefined
  };

  const events: Event[] = await db.getUserEvents(userId, activeUserId, filter);
  res.status(200).send(events);
});

/*
* Get a list of a user's expenses, optionally in an event
*/
router.get("/users/:id/expenses", authCheck, async (req, res) => {
  const userId = req.params.id;
  if (!isUUID(userId)) {
    throw new ErrorExt(ec.PUD016);
  }

  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD055);
  }

  const filter: { eventId?: string, limit?: number, offset?: number } = {
    eventId: req.query.eventId as string,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    offset: req.query.offset ? Number(req.query.offset) : undefined
  };

  if (filter.eventId !== undefined && !isUUID(filter.eventId)) {
    throw new ErrorExt(ec.PUD013);
  }

  const expenses: Expense[] = await db.getUserExpenses(userId, activeUserId, filter);
  res.status(200).send(expenses);
});

/*
* Verify that a register account key is valid
*/
router.get("/verifykey/register/:key", async (req, res) => {
  const key = req.params.key;
  const { email, guestUser, firstName, lastName } = await db.verifyRegisterAccountKey(key);
  if (!email) {
    throw new ErrorExt(ec.PUD101);
  }
  res.status(200).json({ email, guestUser, firstName, lastName });
});

/*
* Verify that a delete account key is valid
*/
router.get("/verifykey/deleteaccount/:key", authCheck, async (req, res) => {
  const key = req.params.key;
  const valid = await db.verifyDeleteAccountKey(key);
  if (!valid) {
    throw new ErrorExt(ec.PUD106);
  }
  res.status(200).json();
});

/* ---- */
/* POST */
/* ---- */

/*
* Register a new user
*/
router.post("/users", async (req, res) => {
  const key: string = req.body.key;
  const keyInfo = await db.verifyRegisterAccountKey(key);

  if (env.IN_PROD) {
    if (!keyInfo.email) {
      throw new ErrorExt(ec.PUD101);
    }
  }

  const guestId = keyInfo.guestUser ? keyInfo.guestId : null;

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

  // Validate username, password, email, and phone number
  if (!isValidUsername(username)) {
    throw new ErrorExt(ec.PUD132);
  }
  if (!isValidPassword(password)) {
    throw new ErrorExt(ec.PUD079);
  }
  if (!isEmail(email)) {
    throw new ErrorExt(ec.PUD004);
  }
  if (!isPhoneNumber(phoneNumber)) {
    throw new ErrorExt(ec.PUD113);
  }

  const hash = createHash(password);

  let user: User;
  if (guestId) {
    user = await db.convertGuestToUser(guestId, username.trim(), firstName.trim(), lastName.trim(), email.trim(), phoneNumber.trim(), hash);
  }
  else {
    user = await db.createUser(username.trim(), firstName.trim(), lastName.trim(), email.trim(), phoneNumber.trim(), hash);
  }

  await db.invalidateRegisterAccountKey(key);
  res.status(200).send(user);
});

/*
* Change signed in user's password
*/
router.post("/users/changepassword", authCheck, async (req, res) => {
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
  if (!isValidPassword(newPassword)) {
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
});

/*
* Invite a new user via email
*/
router.post("/users/invite", authCheck, async (req, res) => {
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

  // Optionally link invite to guest user
  const guestId = req.body.guestId as string | undefined;
  if (guestId && !isUUID(guestId)) {
    throw new ErrorExt(ec.PUD016);
  }

  const user: User | null = await db.getUser(req.session.userId ?? "");
  if (!user) {
    throw new ErrorExt(ec.PUD054);
  }

  const key = generateKey();
  await db.newRegisterAccountKey(email, key, guestId);
  await sendRegisterAccountEmail(email, key, user);
  res.status(200).json({ message: "Email successfully sent" });
});

/*
* Request an account deletion confirmation email
*/
router.post("/users/requestdeleteaccount", authCheck, async (req, res) => {
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
});

/* --- */
/* PUT */
/* --- */

/*
* Edit user
*/
router.put("/users/:id", authCheck, async (req, res) => {
  const userId = req.params.id;
  if (!isUUID(userId)) {
    throw new ErrorExt(ec.PUD016);
  }

  // Users can only edit their own data
  if (req.session.userId !== userId) {
    throw new ErrorExt(ec.PUD136);
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

  // Validate username, email and phone number
  if (username && !isValidUsername(username)) {
    throw new ErrorExt(ec.PUD132);
  }
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
});

/*
* Edit user preferences
*/
router.put("/users/:id/preferences", authCheck, async (req, res) => {
  const userId = req.params.id;
  if (!isUUID(userId)) {
    throw new ErrorExt(ec.PUD016);
  }

  // Users can only edit their own preferences
  if (req.session.userId !== userId) {
    throw new ErrorExt(ec.PUD136);
  }

  const publicEmail: boolean | undefined = req.body.publicEmail !== undefined
    ? req.body.publicEmail === true
    : undefined;
  const publicPhone: boolean | undefined = req.body.publicPhone !== undefined
    ? req.body.publicPhone === true
    : undefined;

  if (publicEmail === undefined && publicPhone === undefined) {
    throw new ErrorExt(ec.PUD133);
  }

  const data = {
    publicEmail: publicEmail,
    publicPhone: publicPhone
  };

  const user = await db.editUserPreferences(userId, data);
  if (!user) {
    throw new ErrorExt(ec.PUD008);
  }
  res.status(200).send(user);
});

/* ------ */
/* DELETE */
/* ------ */

/*
* Delete user
*/
router.delete("/users/:id", authCheck, async (req, res) => {
  const key: string = req.body.key;
  const userId = req.params.id;
  if (!isUUID(userId)) {
    throw new ErrorExt(ec.PUD016);
  }

  

  const valid = await db.verifyDeleteAccountKey(key);
  if (!valid) {
    throw new ErrorExt(ec.PUD106);
  }
  // Users can only delete their own account
  if (req.session.userId !== userId) {
    throw new ErrorExt(ec.PUD137);
  }

  const success = await db.deleteUser(userId, key);

  // Destroy all sessions for this user
  req.sessionStore.destroyAll(userId, err => {
    if (err) {
      throw new ErrorExt(ec.PUD083);
    }
  });

  res.status(200).send({ success: success });
});

export default router;
