import express from "express";
import * as dbUsers from "../db/dbUsers";
import * as dbAuth from "../db/dbAuthentication";
import * as ec from "../types/errorCodes";
import { authenticate, createHash, generateApiKey } from "../utils/auth";
import { generateKey } from "../utils/generateKey";
import { User } from "../types/types";
import { masterKeyCheck } from "../middlewares/authCheck";
import { sendPasswordResetEmail } from "../email-services/passwordReset";
import { ErrorExt } from "../types/errorExt";
const router = express.Router();

import dotenv from "dotenv";
dotenv.config();

/* --- */
/* GET */
/* --- */

/*
* Check if user is signed in
*/
router.get("/login", (req, res) => {
  if (req.session.authenticated) {
    return res.status(200).json({
      authenticated: req.session.authenticated,
      username: req.session.username,
      id: req.session.userId,
      uuid: req.session.uuid
    });
  }
  res.set("WWW-Authenticate", "Session");
  res.status(ec.PUD001.status).json(ec.PUD001);
});

/*
* Verify that a password reset key is valid
*/
router.get("/verifypasswordreset/:key", async (req, res) => {
  const key = req.params.key;

  const valid = await dbAuth.verifyPasswordResetKey(key);
  if (valid) {
    return res.status(200).json();
  }
  res.status(ec.PUD078.status).json(ec.PUD078);
});

export default router;

/* ---- */
/* POST */
/* ---- */

/*
* User sign in
*/
router.post("/login", async (req, res, next) => {
  const { usernameEmail, password } = req.body;
  if (!usernameEmail || !password) {
    return res.status(ec.PUD002.status).json(ec.PUD002);
  }

  try {
    if (req.session.authenticated && req.session.userId) {
      console.log(`User ${req.session.username} already authenticated`);
      const user: User | null = await dbUsers.getUser(req.session.userId);
      if (!user) {
        return res.status(ec.PUD054.status).json(ec.PUD054);
      }
      return res.status(200).json({
        authenticated: req.session.authenticated,
        ...user
      });
    }

    const userPW = await dbAuth.getUserHash(usernameEmail);
    if (!userPW || !userPW.hash) {
      return res.status(ec.PUD003.status).json(ec.PUD003);
    }

    const isAuthenticated = authenticate(password, userPW.hash);

    if (isAuthenticated) {
      const user: User | null = await dbUsers.getUser(userPW.id);
      if (!user) {
        return res.status(ec.PUD054.status).json(ec.PUD054);
      }
      req.session.authenticated = true;
      req.session.userId = user.id;
      req.session.uuid = user.uuid;
      req.session.username = user.username;
      console.log(`User ${user.username} signing in...`, req.sessionID);
      res.status(200).json({
        authenticated: req.session.authenticated,
        ...user
      });
    }
    else {
      res.status(ec.PUD003.status).json(ec.PUD003);
    }
  }
  catch (err) {
    next(err);
  }
});

/*
* User sign out of session
*/
router.post("/logout", (req, res) => {
  if (!req.session.authenticated) {
    return res.status(ec.PUD001.status).json(ec.PUD001);
  }
  const username = req.session.username;
  req.session.destroy(err => {
    if (err) {
      console.log(err);
      return res.status(ec.PUD060.status).json(ec.PUD060);
    }
    console.log(`User ${username} successfully signed out`);
    res.status(200).json({ msg: "Signed out successfully" });
  });
});

/*
* Generate API key
*/
router.post("/generatekey", masterKeyCheck, async (req, res, next) => {
  const name = req.query.name as string;
  if (!name) {
    return res.status(ec.PUD068.status).json(ec.PUD068);
  }

  try {
    const key = generateApiKey();
    const hash = createHash(key);
    await dbAuth.newApiKey(name, hash);
    res.status(200).json(key);
  }
  catch (err) {
    next(err);
  }
});

/*
* Request a password reset
*/
router.post("/requestpasswordreset", async (req, res, next) => {
  const email = req.body.email;
  if (!email) {
    return res.status(ec.PUD072.status).json(ec.PUD072);
  }

  try {
    if (!process.env.PUDDINGDEBT_EMAIL || !process.env.PUDDINGDEBT_EMAIL_PASSWORD) {
      throw new ErrorExt(ec.PUD073);
    }

    const userId = await dbUsers.getUserID(email);
    if (!userId) {
      const delay = Math.floor((Math.random() * 1500) + 1500);
      await new Promise(resolve => setTimeout(() => {
        const response = res.status(200).json();
        resolve(response);
      }, delay));
      return;
    }

    const key = generateKey();
    await dbAuth.newPasswordResetKey(userId, key);
    await sendPasswordResetEmail(email, key);
    res.status(200).json();
  }
  catch (err) {
    next(err);
  }
});

/*
* Reset a password
*/
router.post("/resetpassword", async (req, res, next) => {
  const key: string = req.body.key;
  const valid = await dbAuth.verifyPasswordResetKey(key);
  if (!valid) {
    return res.status(ec.PUD078.status).json(ec.PUD078);
  }

  const password: string = req.body.password;
  if (!password || password.trim() === "") {
    return res.status(ec.PUD079.status).json(ec.PUD079);
  }

  try {
    const hash = createHash(password);
    await dbAuth.resetPassword(key, hash);
    res.status(200).json();
  }
  catch (err) {
    next(err);
  }
});
