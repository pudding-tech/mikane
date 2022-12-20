import express from "express";
import sql from "mssql";
import { checkAuth } from "./middleware/authMiddleware";
const router = express.Router();

/* --- */
/* GET */
/* --- */

// Get a list of all events
router.get("/events", checkAuth, (req, res, next) => {
  const request = new sql.Request();
  request
    .input("event_id", sql.Int, null)
    .execute("get_events")
    .then(data => {
      res.send(data.recordset);
    })
    .catch(err => next(err));
});

// Get specific event
router.get("/events/:id", checkAuth, (req, res, next) => {
  const eventId = Number(req.params.id);
  if (isNaN(eventId)) {
    return res.status(400).json({ err: "Event ID must be a number" });
  }
  const request = new sql.Request();
  request
    .input("event_id", sql.Int, eventId)
    .execute("get_events")
    .then(data => {
      res.send(data.recordset);
    })
    .catch(err => next(err));
});

/* ---- */
/* POST */
/* ---- */

// Create new event
router.post("/events", checkAuth, (req, res, next) => {
  if (!req.body.name) {
    return res.status(400).send("Name not provided!");
  }
  const request = new sql.Request();
  request
    .input("name", sql.NVarChar, req.body.name)
    .execute("new_event")
    .then(data => {
      res.send(data.recordset[0]);
    })
    .catch(err => next(err));
});

/* ------ */
/* DELETE */
/* ------ */

// Delete an event
router.delete("/events", checkAuth, (req, res, next) => {
  if (!req.body.id) {
    return res.status(400).send("Event ID not provided!");
  }
  const request = new sql.Request();
  request
    .input("event_id", sql.Int, req.body.id)
    .execute("delete_event")
    .then(() => {
      res.send({});
    })
    .catch(err => next(err));
});

export default router;
