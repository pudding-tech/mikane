import express from "express";
import env from "../env.ts";
import { getEvent, getEventPayments } from "../db/dbEvents.ts";
import { getUsers } from "../db/dbUsers.ts";
import { authCheck } from "../middlewares/authCheck.ts";
import { isUUID } from "../utils/validators/uuidValidator.ts";
import { EventStatusType } from "../types/enums.ts";
import { ErrorExt } from "../types/errorExt.ts";
import { sendAddExpensesReminderEmails } from "../email-services/notifications/addExpensesReminder.ts";
import { sendReadyToSettleEmails } from "../email-services/notifications/readyToSettle.ts";
import { createDate } from "../utils/dateCreator.ts";
import * as ec from "../types/errorCodes.ts";
const router = express.Router();

/*
* Send 'add expenses reminder' email to all participants in an event
*/
router.post("/notifications/:eventId/reminder", authCheck, async (req, res) => {
  if (!env.MIKANE_EMAIL || !env.MIKANE_EMAIL_API_TOKEN) {
    throw new ErrorExt(ec.PUD073);
  }

  const eventId = req.params.eventId;
  if (!isUUID(eventId)) {
    throw new ErrorExt(ec.PUD013);
  }

  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD055);
  }

  const cutoffDate = req.body.cutoffDate ? createDate(req.body.cutoffDate) : undefined;

  const event = await getEvent(eventId, activeUserId);
  if (!event) {
    throw new ErrorExt(ec.PUD006);
  }
  if (event.status.id !== EventStatusType.ACTIVE) {
    throw new ErrorExt(ec.PUD143);
  }

  const users = await getUsers(activeUserId, { eventId: eventId, excludeGuests: true });

  await sendAddExpensesReminderEmails(users, event, cutoffDate);
  res.status(200).json({ message: "Emails successfully sent" });
});

/*
* Send 'ready-to-settle' email to all participants in an event
*/
router.post("/notifications/:eventId/settle", authCheck, async (req, res) => {
  if (!env.MIKANE_EMAIL || !env.MIKANE_EMAIL_API_TOKEN) {
    throw new ErrorExt(ec.PUD073);
  }

  const eventId = req.params.eventId;
  const activeUserId = req.session.userId;
  if (!isUUID(eventId)) {
    throw new ErrorExt(ec.PUD013);
  }

  const event = await getEvent(eventId, activeUserId);
  if (!event) {
    throw new ErrorExt(ec.PUD006);
  }
  if (event.status.id !== EventStatusType.READY_TO_SETTLE) {
    throw new ErrorExt(ec.PUD140);
  }

  const payments = await getEventPayments(event.id, activeUserId);

  await sendReadyToSettleEmails(payments, event);
  res.status(200).json({ message: "Emails successfully sent" });
});

export default router;
