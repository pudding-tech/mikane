import express from "express";
import sql from "mssql";
const router = express.Router();

router.get("/users", (req, res, next) => {
  const request = new sql.Request();
  request
    .input("event_id", sql.Int, req.query.eventId)
    .execute("get_users")
    .then( (data) => {
      res.send(data.recordset);
    })
    .catch(next);
});

router.post("/users", (req, res, next) => {
  if (!req.body.name || !req.body.eventId) {
    return res.status(400).send("Name or eventId not provided!");
  }
  console.log("NEW USER");
  const request = new sql.Request();
  request
    .input("name", sql.NVarChar, req.body.name)
    .input("event_id", sql.Int, req.body.eventId)
    .execute("new_user")
    .then( (data) => {
      res.send(data.recordset);
    })
    .catch(next);
});

export default router;