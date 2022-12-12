import express from "express";
import sql from "mssql";
const router = express.Router();

/* --- */
/* GET */
/* --- */

// Get a list of all events
router.get("/events", (req, res, next) => {
  const request = new sql.Request();
  request
    .input("event_id", sql.Int, null)
    .execute("get_events")
    .then(data => {
      res.send(data.recordset);
    })
    .catch(next);
});

// Get specific event
router.get("/events/:id", (req, res, next) => {
  const request = new sql.Request();
  request
    .input("event_id", sql.Int, req.params.id)
    .execute("get_events")
    .then(data => {
      res.send(data.recordset);
    })
    .catch(next);
});

/* ---- */
/* POST */
/* ---- */

// Create new event
router.post("/events", (req, res, next) => {
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
    .catch(next);
});

/* ------ */
/* DELETE */
/* ------ */

// Delete an event
router.delete("/events", (req, res, next) => {
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
    .catch(next);
});

export default router;