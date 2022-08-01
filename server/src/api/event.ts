import express from "express";
import sql from "mssql";
const router = express.Router();

router.get("/events", (req, res, next) => {
  const request = new sql.Request();
  request
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

router.post("/events/:eventId/user", (req, res, next) => {
  const eventId = Number(req.params.eventId);
  if (isNaN(eventId)) {
    return res.status(400).send("Event ID is not a number!");
  }
  if (!req.body.userId) {
    return res.status(400).send("UserId not provided!");
  }
  const request = new sql.Request();
  request
    .input("event_id", sql.Int, eventId)
    .input("user_id", sql.Int, req.body.userId)
    .execute("add_user_to_event")
    .then( (data) => {
      res.send(data.recordset);
    })
    .catch(next);
});

export default router;