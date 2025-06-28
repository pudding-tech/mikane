import express from "express";
import * as db from "../db/dbEvents";
import { authCheck, authKeyCheck } from "../middlewares/authCheck";
import { removeUserInfoFromPayments, removeUserInfoFromUserBalances } from "../parsers/parseUserInfo";
import { isUUID } from "../utils/validators/uuidValidator";
import { Event, Payment, UserBalance } from "../types/types";
import { ErrorExt } from "../types/errorExt";
import * as ec from "../types/errorCodes";
const router = express.Router();

/* --- */
/* GET */
/* --- */

/*
* Get a list of all events
*/
router.get("/events", authCheck, async (req, res) => {
  const activeUserId = req.session.userId;
  const events: Event[] = await db.getEvents(activeUserId);
  res.status(200).send(events);
});

/*
* Get specific event
*/
router.get("/events/:id", authCheck, async (req, res) => {
  const eventId = req.params.id;
  const activeUserId = req.session.userId;
  if (!isUUID(eventId)) {
    throw new ErrorExt(ec.PUD013);
  }

  const event = await db.getEvent(eventId, activeUserId);
  if (!event) {
    throw new ErrorExt(ec.PUD006);
  }
  res.status(200).send(event);
});

/*
* Get specific event by name
*/
router.get("/eventbyname", authKeyCheck, async (req, res) => {
  const eventName = req.body.name;
  const activeUserId = req.session.userId;
  const authIsApiKey = req.authIsApiKey;

  const event = await db.getEventByName(eventName, activeUserId, authIsApiKey);
  if (!event) {
    throw new ErrorExt(ec.PUD006);
  }
  res.status(200).send(event);
});

/*
* Get a list of all users' balance information for an event
*/
router.get("/events/:id/balances", authCheck, async (req, res) => {
  const eventId = req.params.id;
  const activeUserId = req.session.userId;
  if (!isUUID(eventId)) {
    throw new ErrorExt(ec.PUD013);
  }

  const usersWithBalance: UserBalance[] = await db.getEventBalances(eventId, activeUserId);

  // Remove sensitive user information
  removeUserInfoFromUserBalances(usersWithBalance, activeUserId ?? "");

  // Put logged in user first in list
  if (activeUserId) {
    const index = usersWithBalance.findIndex(userBalance => userBalance.user.id === activeUserId);
    if (index !== -1) {
      const userBalance = usersWithBalance.splice(index, 1)[0];
      usersWithBalance.unshift(userBalance);
    }
  }

  res.status(200).send(usersWithBalance);
});

/*
* Get a list of all payments for a given event
*/
router.get("/events/:id/payments", authKeyCheck, async (req, res) => {
  const eventId = req.params.id;
  const activeUserId = req.session.userId;
  if (!isUUID(eventId)) {
    throw new ErrorExt(ec.PUD013);
  }

  const payments: Payment[] = await db.getEventPayments(eventId, activeUserId);

  // Remove sensitive user information
  removeUserInfoFromPayments(payments, activeUserId ?? "");

  // Put logged in user first in list
  if (activeUserId) {
    const index = payments.findIndex(payment => payment.sender.id === activeUserId);
    if (index !== -1) {
      const user = payments.splice(index, 1)[0];
      payments.unshift(user);
    }
  }

  res.status(200).send(payments);
});

/* ---- */
/* POST */
/* ---- */

/*
* Create new event
*/
router.post("/events", authCheck, async (req, res) => {
  const name: string = req.body.name;
  if (!name || (req.body.private === null || req.body.private === undefined)) {
    throw new ErrorExt(ec.PUD014);
  }
  if (name.trim() === "") {
    throw new ErrorExt(ec.PUD053);
  }
  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD055);
  }

  const createdEvent: Event = await db.createEvent(name.trim(), activeUserId, req.body.private, req.body.description);
  const event = await db.getEvent(createdEvent.id, activeUserId);
  res.status(200).send(event);
});

/*
* Add a user to an event
*/
router.post("/events/:id/user/:userId", authCheck, async (req, res) => {
  const eventId = req.params.id;
  const userId = req.params.userId;
  if (!isUUID(eventId) || !isUUID(userId)) {
    throw new ErrorExt(ec.PUD015);
  }

  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD055);
  }

  const event: Event = await db.addUserToEvent(eventId, userId, activeUserId);
  res.send(event);
});

/*
* Set a user as admin for an event
*/
router.post("/events/:id/admin/:userId", authCheck, async (req, res) => {
  const eventId = req.params.id;
  const userId = req.params.userId;
  if (!isUUID(eventId) || !isUUID(userId)) {
    throw new ErrorExt(ec.PUD015);
  }
  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD055);
  }

  const event: Event = await db.addUserAsEventAdmin(eventId, userId, activeUserId);
  res.send(event);
});

/* --- */
/* PUT */
/* --- */

/*
* Edit event
*/
router.put("/events/:id", authCheck, async (req, res) => {
  const eventId = req.params.id;
  if (!isUUID(eventId)) {
    throw new ErrorExt(ec.PUD013);
  }
  if (![undefined, null].includes(req.body.name) && req.body.name.trim() === "") {
    throw new ErrorExt(ec.PUD053);
  }
  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD055);
  }

  const event = await db.editEvent(eventId, activeUserId, req.body.name, req.body.description, req.body.private, req.body.status);
  if (!event) {
    throw new ErrorExt(ec.PUD006);
  }
  res.status(200).send(event);
});

/* ------ */
/* DELETE */
/* ------ */

/*
* Delete event
*/
router.delete("/events/:id", authCheck, async (req, res) => {
  const eventId = req.params.id;
  if (!isUUID(eventId)) {
    throw new ErrorExt(ec.PUD013);
  }
  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD055);
  }

  const success = await db.deleteEvent(eventId, activeUserId);
  res.status(200).send({ success: success });
});

/*
* Remove a user from an event
*/
router.delete("/events/:id/user/:userId", authCheck, async (req, res) => {
  const eventId = req.params.id;
  const userId = req.params.userId;
  if (!isUUID(eventId) || !isUUID(userId)) {
    throw new ErrorExt(ec.PUD015);
  }

  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD055);
  }

  const event: Event = await db.removeUserFromEvent(eventId, userId, activeUserId);
  res.status(200).send(event);
});

/*
* Remove a user as event admin
*/
router.delete("/events/:id/admin/:userId", authCheck, async (req, res) => {
  const eventId = req.params.id;
  const userId = req.params.userId;
  if (!isUUID(eventId) || !isUUID(userId)) {
    throw new ErrorExt(ec.PUD015);
  }
  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD055);
  }

  const event: Event = await db.removeUserAsEventAdmin(eventId, userId, activeUserId);
  res.status(200).send(event);
});

export default router;
