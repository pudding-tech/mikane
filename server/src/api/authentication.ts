import express from "express";
import env from "../env.ts";
import logger from "../utils/logger.ts";
import * as dbUsers from "../db/dbUsers.ts";
import * as dbAuth from "../db/dbAuthentication.ts";
import * as ec from "../types/errorCodes.ts";
import { authenticate, createHash, generateApiKey } from "../utils/auth.ts";
import { generateKey } from "../utils/generateKey.ts";
import { User } from "../types/types.ts";
import { masterKeyCheck } from "../middlewares/authCheck.ts";
import { isValidPassword } from "../utils/validators/passwordValidator.ts";
import { sendPasswordResetEmail } from "../email-services/passwordReset.ts";
import { ErrorExt } from "../types/errorExt.ts";
const router = express.Router();

/* --- */
/* GET */
/* --- */

/*
* Check if user is signed in
*/
router.get("/login", (req, res) => {
  if (!req.session.authenticated) {
    throw new ErrorExt(ec.PUD000);
  }
  res.status(200).json({
    authenticated: req.session.authenticated,
    id: req.session.userId,
    username: req.session.username,
    avatarURL: req.session.avatarURL,
    superAdmin: req.session.superAdmin
  });
});

/*
* Verify that a password reset key is valid
*/
router.get("/verifykey/passwordreset/:key", async (req, res) => {
  const key = req.params.key;
  const valid = await dbAuth.verifyPasswordResetKey(key);
  if (!valid) {
    throw new ErrorExt(ec.PUD078);
  }
  res.status(200).json();
});

/* ---- */
/* POST */
/* ---- */

/*
* User sign in
*/
router.post("/login", async (req, res) => {
  const { usernameEmail, password } = req.body;
  if (!usernameEmail || !password) {
    throw new ErrorExt(ec.PUD002);
  }

  if (req.session.authenticated && req.session.userId) {
    logger.info(`User ${req.session.username} tried signing in, but is already authenticated`);
    const user: User | null = await dbUsers.getUser(req.session.userId);
    if (!user) {
      throw new ErrorExt(ec.PUD054);
    }
    res.status(200).json({
      authenticated: req.session.authenticated,
      ...user
    });
    return;
  }

  const userPW = await dbAuth.getUserHash(usernameEmail);
  if (!userPW || !userPW.hash) {
    throw new ErrorExt(ec.PUD003);
  }

  const isAuthenticated = authenticate(password, userPW.hash);
  if (!isAuthenticated) {
    throw new ErrorExt(ec.PUD003);
  }

  const user: User | null = await dbUsers.getUser(userPW.id);
  if (!user) {
    throw new ErrorExt(ec.PUD054);
  }
  req.session.authenticated = true;
  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.avatarURL = user.avatarURL;
  req.session.superAdmin = user.superAdmin;
  logger.info(`User ${user.username} signing in - sessionId: `, req.sessionID);
  res.status(200).json({
    authenticated: req.session.authenticated,
    ...user
  });
});

/*
* User sign out of session
*/
router.post("/logout", (req, res) => {
  if (!req.session.authenticated) {
    throw new ErrorExt(ec.PUD001);
  }

  const username = req.session.username;
  req.session.destroy(err => {
    if (err) {
      throw new ErrorExt(ec.PUD060);
    }
    logger.info(`User ${username} successfully signed out`);
    res.status(200).json({ msg: "Signed out successfully" });
  });
});

/*
* Generate API key
*/
router.post("/generatekey", masterKeyCheck, async (req, res) => {
  const name = req.body.name as string;
  if (!name) {
    throw new ErrorExt(ec.PUD068);
  }

  const key = generateApiKey();
  const hash = createHash(key);
  await dbAuth.newApiKey(name, hash);
  res.status(200).json(key);
});

/*
* Request a password reset
*/
router.post("/requestpasswordreset", async (req, res) => {
  if (!env.MIKANE_EMAIL || !env.MIKANE_EMAIL_PASSWORD) {
    throw new ErrorExt(ec.PUD073);
  }

  const email = req.body.email as string;
  if (!email) {
    throw new ErrorExt(ec.PUD072);
  }

  const userId = await dbUsers.getUserID(email);
  if (!userId) {
    // If the user does not exist, randomize the response time to simulate the delay of sending an email, thereby preventing any indication to the end user about the user's existence
    const delay = Math.floor((Math.random() * 1500) + 1500);
    await new Promise(resolve => setTimeout(() => {
      const response = res.status(200).json({ message: "Email successfully sent" });
      resolve(response);
    }, delay));
    return;
  }

  const key = generateKey();
  await dbAuth.newPasswordResetKey(userId, key);
  await sendPasswordResetEmail(email, key);
  res.status(200).json({ message: "Email successfully sent" });
});

/*
* Reset a password
*/
router.post("/resetpassword", async (req, res) => {
  const key: string = req.body.key;
  const valid = await dbAuth.verifyPasswordResetKey(key);
  if (!valid) {
    throw new ErrorExt(ec.PUD078);
  }

  const password: string = req.body.password;
  if (!isValidPassword(password)) {
    throw new ErrorExt(ec.PUD079);
  }

  const hash = createHash(password);
  await dbAuth.resetPassword(key, hash);
  res.status(200).json();
});

export default router;
