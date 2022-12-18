import express from "express";
import sql from "mssql";
import { authenticate, createHash } from "../utils/auth";
import { isEmail } from "../utils/emailValidator";
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
  res.status(401).send();
});

/* ---- */
/* POST */
/* ---- */

/*
* User sign in
*/
router.post("/login", async (req, res, next) => {
  const {username, password} = req.body;
  if (!username || !password) {
    return res.status(400).json({ err: "Missing credentials" });
  }

  if (req.session.authenticated) {
    console.log(`User ${req.session.username} already authenticated`);
    return res.json(req.session);
  }

  const request = new sql.Request();
  const user: User | void = await request
    .input("username", sql.NVarChar, username)
    .execute("get_user")
    .then(res => parseUser(res.recordset[0]))
    .catch(err => next(err));

  console.log(user);
  if (!user || !user.hash) {
    return res.status(401).json({ err: "User does not exist"});
  }

  const authenticated = authenticate(password, user.hash);

  if (authenticated) {
    req.session.authenticated = true;
    req.session.username = user.username;
    console.log(`User ${user.username} signing in...`, req.sessionID);
    return res.json(req.session);
  }
  res.status(401).json({ err: "Password does not match" });
});

/*
* User sign out of session
*/
router.post("/logout", (req, res) => {
  if (!req.session) {
    return res.status(400).json({ err: "No user signed in" });
  }

  req.session.destroy(err => {
    if (err) {
      return res.status(500).send("Unable to sign out");
    }
    console.log(`User ${req.session.username} successfully signed out`);
    res.status(200).json({msg: "Signed out successfully"});
  });
});

/*
* Register new user
*/
router.options("/register", async (req, res, next) => {
  if (!req.body.name || !req.body.password) {
    return res.status(400).send("Name or password not provided");
  }

  // Validate email
  if (!isEmail(req.body.email)) {
    return res.status(400).send("Not a valid email");
  }

  const hash = createHash(req.body.password);
  
  const request = new sql.Request();
  const user = await request
    .input("username", sql.NVarChar, req.body.name)
    .input("event_id", sql.Int, req.body.eventId)
    .input("email", sql.NVarChar, req.body.email)
    .input("password", sql.NVarChar, hash)
    .execute("new_user")
    .then(data => {
      const users: User[] = parseUsers(data.recordset);
      return users[0];
    })
    .catch(err => next(err));

  res.send(user);
});

export default router;
