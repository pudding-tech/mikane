import express from "express";
import sql from "mssql";
const router = express.Router();

router.get("/events", (req, res, next) => {
  const request = new sql.Request();
  request
    .input("name", sql.NVarChar, null)
    .execute("get_events")
    .then( (data) => {
      res.send(data.recordset);
    })
    .catch(next);
});

router.post("/events", (req, res, next) => {
  if (!req.body.name) {
    return res.status(400).send("Name not provided!");
  }
  const request = new sql.Request();
  request
    .input("name", sql.NVarChar, req.body.name)
    .execute("new_event")
    .then( (data) => {
      res.send(data.recordset);
    })
    .catch(next);
});

router.post("/userInEvent", (req, res, next) => {
  if (!req.body.eventId || !req.body.userId) {
    return res.status(400).send("EventId or userId not provided!");
  }
  const request = new sql.Request();
  request
    .input("event_id", sql.Int, req.body.eventId)
    .input("user_id", sql.Int, req.body.userId)
    .execute("add_user_to_event")
    .then( (data) => {
      res.send(data.recordset);
    })
    .catch(next);
});

export default router;