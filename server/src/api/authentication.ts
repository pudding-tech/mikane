import express from "express";
import sql from "mssql";
import * as dbUsers from "../db/dbUsers";
import * as dbAuth from "../db/dbAuthentication";
import * as ec from "../types/errorCodes";
import { authenticate, createHash, generateApiKey } from "../utils/auth";
import { parseUser } from "../parsers";
import { User } from "../types/types";
import { authKeyCheck } from "../middlewares/authCheck";
const router = express.Router();

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
  res.status(401).json(ec.PUD001);
});

/* ---- */
/* POST */
/* ---- */

/*
* User sign in
*/
router.post("/login", async (req, res, next) => {
  const {usernameEmail, password} = req.body;
  if (!usernameEmail || !password) {
    return res.status(400).json(ec.PUD002);
  }

  try {
    if (req.session.authenticated && req.session.userId) {
      console.log(`User ${req.session.username} already authenticated`);
      const user: User | null = await dbUsers.getUser(req.session.userId);
      if (!user) {
        return res.status(500).json(ec.PUD054);
      }
      return res.status(200).json({
        authenticated: req.session.authenticated,
        ...user
      });
    }

    const userPW = await dbAuth.getUserHash(usernameEmail);
    if (!userPW || !userPW.hash) {
      return res.status(401).json(ec.PUD003);
    }

    const isAuthenticated = authenticate(password, userPW.hash);

    if (isAuthenticated) {
      const user: User | null = await dbUsers.getUser(userPW.id);
      if (!user) {
        return res.status(500).json(ec.PUD054);
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
      res.status(401).json(ec.PUD003);
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
    return res.status(400).json(ec.PUD001);
  }
  const username = req.session.username;
  req.session.destroy(err => {
    if (err) {
      console.log(err);
      return res.status(500).json(ec.PUD060);
    }
    console.log(`User ${username} successfully signed out`);
    res.status(200).json({ msg: "Signed out successfully" });
  });
});

/*
* Generate API key
*/
router.post("/generatekey", authKeyCheck, async (req, res, next) => {
  const name = req.query.name as string;
  if (!name) {
    return res.status(400).json(ec.PUD068);
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
router.post("/reset-password", async (req, res, next) => {
  if (!req.body.userId || !req.body.password) {
    return res.status(400).json({ error: "User ID or new password not provided" });
  }

  const hash = createHash(req.body.password);

  const request = new sql.Request();
  const user = await request
    .input("user_id", sql.Int, req.body.userId)
    .input("password", sql.NVarChar, hash)
    .execute("reset_password")
    .then(res => {
      console.log(res.recordset);
      const user: User = parseUser(res.recordset[0]);
      console.log(user);
      return user;
    })
    .catch(err => next(err));

  res.status(200).send(user);
});

/*
* Reset a user's password
*/
router.post("/confirm-reset-password", async (req, res) => {
  res.status(200).send();
});

export default router;
