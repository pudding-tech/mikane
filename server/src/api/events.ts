import express from "express";
import * as db from "../db/dbEvents";
import { checkAuth } from "../middleware/authMiddleware";
import { Event, Payment, UserBalance } from "../types/types";
const router = express.Router();

/* --- */
/* GET */
/* --- */

// Get a list of all events
router.get("/events", checkAuth, async (req, res, next) => {
  try {
    const events: Event[] = await db.getEvents();
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
    const event: Event = await db.getEvent(eventId);
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
    return res.status(400).json({ error: "ID must be a number" });
  }
  try {
    const usersWithBalance: UserBalance[] = await db.getEventBalances(eventId);
    res.status(200).send(usersWithBalance);
  }
  catch (err) {
    next(err);
  }
});

// Get a list of all payments for a given event
router.get("events/:id/payments", checkAuth, async (req, res, next) => {
  const eventId = Number(req.params.id);
  if (isNaN(eventId)) {
    return res.status(400).json({ error: "ID must be a number" });
  }
  try {
    const payments: Payment[] = await db.getEventPayments(eventId);
    res.status(200).send(payments);
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
    return res.status(400).json({ error: "Name not provided!" });
  }
  try {
    const event: Event = await db.createEvent(req.body.name);
    res.status(200).send(event);
  }
  catch (err) {
    next(err);
  }
});

// Add a user to an event
router.post("/events/:id/user/:userId", checkAuth, async (req, res, next) => {
  const eventId = Number(req.params.id);
  const userId = Number(req.params.userId);

  if (isNaN(eventId) || isNaN(userId)) {
    return res.status(400).json({ error: "Event ID and user ID must be numbers" });
  }
  try {
    const event: Event = await db.addUserToEvent(userId, eventId);
    res.send(event);
  }
  catch (err) {
    next(err);
  }
});

/* ------ */
/* DELETE */
/* ------ */

// Delete an event
router.delete("/events/:id", checkAuth, async (req, res, next) => {
  const eventId = Number(req.params.id);
  if (isNaN(eventId)) {
    return res.status(400).json({ error: "Event ID must be a number" });
  }
  try {
    const success = await db.deleteEvent(eventId);
    res.status(200).send({ success: success });
  }
  catch (err) {
    next(err);
  }
});

// Remove a user from an event
router.delete("/events/:id/user/:userId", checkAuth, async (req, res, next) => {
  const eventId = Number(req.params.id);
  const userId = Number(req.params.userId);
  if (isNaN(eventId) || isNaN(userId)) {
    return res.status(400).json({ error: "Event ID and user ID must be numbers!" });
  }
  try {
    const event: Event = await db.removeUserFromEvent(eventId, userId);
    res.status(200).send(event);
  }
  catch (err) {
    next(err);
  }
});

export default router;
