import express from "express";
import sql from "mssql";
import { getEvents, getEvent, getEventBalances, postEvent, deleteEvent } from "../db/dbEvents";
import { checkAuth } from "../middleware/authMiddleware";
const router = express.Router();

/* --- */
/* GET */
/* --- */

// Get a list of all events
router.get("/events", checkAuth, async (req, res, next) => {
  try {
    const events = await getEvents();
    res.status(200).send(events);
  }
  catch (err) {
    next(err);
  }
});

// Get specific event
router.get("/events/:id", checkAuth, async (req, res, next) => {
  const eventId = Number(req.params.id);
  if (isNaN(eventId)) {
    return res.status(400).json({ err: "Event ID must be a number" });
  }
  try {
    const event = await getEvent(eventId);
    res.status(200).send(event);
  }
  catch (err) {
    next(err);
  }
});

// Get a list of all users' balance information for an event
router.get("/events/:id/balances", checkAuth, async (req, res, next) => {
  const eventId = Number(req.params.id);
  if (isNaN(eventId)) {
    return res.status(400).json("Event ID must be a number");
  }
  try {
    const usersWithBalance = await getEventBalances(eventId);
    res.send(usersWithBalance);
  }
  catch (err) {
    next(err);
  }
});

/* ---- */
/* POST */
/* ---- */

// Create new event
router.post("/events", checkAuth, async (req, res, next) => {
  if (!req.body.name) {
    return res.status(400).send("Name not provided!");
  }
  try {
    const event = await postEvent(req.body.name);
    res.status(200).send(event);
  }
  catch (err) {
    next(err);
  }
});

/* ------ */
/* DELETE */
/* ------ */

// Delete an event
router.delete("/events", checkAuth, async (req, res, next) => {
  if (!req.body.id) {
    return res.status(400).send("Event ID not provided");
  }
  try {
    await deleteEvent(req.body.id);
    res.send({});
  }
  catch (err) {
    next(err);
  }
});

export default router;
