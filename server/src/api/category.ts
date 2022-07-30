import express from "express";
import sql from "mssql";
const router = express.Router();

router.get("/categories", (req, res, next) => {
  if (!req.query.eventId) {
    return res.status(400).send("EventId not provided!");
  }
  const request = new sql.Request();
  request
    .input("event_id", sql.Int, req.query.eventId)
    .execute("get_categories")
    .then( (data) => {
      res.send(data.recordset);
    })
    .catch(next);
});

router.post("/categories", (req, res, next) => {
  if (!req.body.name || !req.body.eventId) {
    return res.status(400).send("Name or eventId not provided!");
  }
  const request = new sql.Request();
  request
    .input("name", sql.NVarChar, req.body.name)
    .input("event_id", sql.Int, req.body.eventId)
    .execute("new_category")
    .then( (data) => {
      res.send(data.recordset);
    })
    .catch(next);
});

export default router;