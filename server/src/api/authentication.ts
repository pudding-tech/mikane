import express from "express";
import env from "../env";
import * as dbUsers from "../db/dbUsers";
import * as dbAuth from "../db/dbAuthentication";
import * as ec from "../types/errorCodes";
import { authenticate, createHash, generateApiKey } from "../utils/auth";
import { generateKey } from "../utils/generateKey";
import { User } from "../types/types";
import { masterKeyCheck } from "../middlewares/authCheck";
import { isValidPassword } from "../utils/validators/passwordValidator";
import { sendPasswordResetEmail } from "../email-services/passwordReset";
import { ErrorExt } from "../types/errorExt";
const router = express.Router();

/* --- */
/* GET */
/* --- */

/*
* Check if user is signed in
*/
router.get("/login", (req, res, next) => {
  try {
    if (!req.session.authenticated) {
      throw new ErrorExt(ec.PUD000);
    }
    return res.status(200).json({
      authenticated: req.session.authenticated,
      id: req.session.userId,
      username: req.session.username,
      avatarURL: req.session.avatarURL,
      superAdmin: req.session.superAdmin
    });
  }
  catch (err) {
    next(err);
  }
});

/*
* Verify that a password reset key is valid
*/
router.get("/verifykey/passwordreset/:key", async (req, res, next) => {
  try {
    const key = req.params.key;
    const valid = await dbAuth.verifyPasswordResetKey(key);
    if (!valid) {
      throw new ErrorExt(ec.PUD078);
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
* User sign in
*/
router.post("/login", async (req, res, next) => {
  try {
    const { usernameEmail, password } = req.body;
    if (!usernameEmail || !password) {
      throw new ErrorExt(ec.PUD002);
    }

    if (req.session.authenticated && req.session.userId) {
      console.log(`User ${req.session.username} already authenticated`);
      const user: User | null = await dbUsers.getUser(req.session.userId);
      if (!user) {
        throw new ErrorExt(ec.PUD054);
      }
      return res.status(200).json({
        authenticated: req.session.authenticated,
        ...user
      });
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
    console.log(`User ${user.username} signing in...`, req.sessionID);
    res.status(200).json({
      authenticated: req.session.authenticated,
      ...user
    });
  }
  catch (err) {
    next(err);
  }
});

/*
* User sign out of session
*/
router.post("/logout", (req, res, next) => {
  try {
    if (!req.session.authenticated) {
      throw new ErrorExt(ec.PUD001);
    }

    const username = req.session.username;
    req.session.destroy(err => {
      if (err) {
        throw new ErrorExt(ec.PUD060);
      }
      console.log(`User ${username} successfully signed out`);
      res.status(200).json({ msg: "Signed out successfully" });
    });
  }
  catch (err) {
    next(err);
  }
});

/*
* Generate API key
*/
router.post("/generatekey", masterKeyCheck, async (req, res, next) => {
  try {
    const name = req.body.name as string;
    if (!name) {
      throw new ErrorExt(ec.PUD068);
    }

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
  try {
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
  }
  catch (err) {
    next(err);
  }
});

/*
* Reset a password
*/
router.post("/resetpassword", async (req, res, next) => {
  try {
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
  }
  catch (err) {
    next(err);
  }
});

export default router;
