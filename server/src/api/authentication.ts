import express from "express";
import sql from "mssql";
import { authenticate, createHash } from "../utils/auth";
import { isEmail } from "../utils/emailValidator";
import { PUD001, PUD002, PUD003, PUD004 } from "../utils/errorCodes";
import { parseUser, parseUsers } from "../parsers";
import { User } from "../types/types";
const router = express.Router();

/* --- */
/* GET */
/* --- */

/*
* Check if user is signed in
*/
router.get("/login", (req, res) => {
  if (req.session.authenticated) {
    return res.status(200).json(req.session);
  }
  res.set("WWW-Authenticate", "Session");
  res.status(401).json(PUD001);
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
    return res.status(400).json(PUD002);
  }

  if (req.session.authenticated) {
    console.log(`User ${req.session.username} already authenticated`);
    return res.status(200).json(req.session);
  }

  const request = new sql.Request();
  const user: User | void = await request
    .input("username", sql.NVarChar, usernameEmail)
    .execute("get_user")
    .then(res => {
      if (!res.recordset[0]) {
        return;
      }
      return parseUser(res.recordset[0]);
    })
    .catch(err => next(err));

  if (!user || !user.hash) {
    return res.status(401).json(PUD003);
  }

  const isAuthenticated = authenticate(password, user.hash);

  if (isAuthenticated) {
    req.session.authenticated = true;
    req.session.userId = user.id;
    req.session.username = user.username;
    console.log(`User ${user.username} signing in...`, req.sessionID);
    return res.status(200).json(req.session);
  }
  res.status(401).json(PUD003);
});

/*
* User sign out of session
*/
router.post("/logout", (req, res) => {
  if (!req.session.authenticated) {
    return res.status(400).json(PUD001);
  }

  req.session.destroy(err => {
    if (err) {
      console.log(err);
      return res.status(500).json("Unable to sign out");
    }
    console.log(`User ${req.session.username} successfully signed out`);
    res.status(200).json({ msg: "Signed out successfully" });
  });
});

/*
* Register a new user
*/
router.post("/register", async (req, res, next) => {
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

/*
* Reset a user's password
*/
router.post("/resetPassword", async (req, res, next) => {
  if (!req.body.userId || !req.body.password) {
    return res.status(400).send("User ID or new password not provided");
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

  res.send(user);
});

export default router;
