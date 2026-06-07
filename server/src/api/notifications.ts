import express from "express";
import env from "../env.ts";
import { getEvent, getEventPayments } from "../db/dbEvents.ts";
import { getUsers } from "../db/dbUsers.ts";
import { getCurrencies } from "../db/dbConfig.ts";
import { authCheck } from "../middlewares/authCheck.ts";
import { csrfCheck } from "../middlewares/csrf.ts";
import { singleRequestLimiter } from "../middlewares/singleRequestLimiter.ts";
import { isUUID } from "../utils/validators/uuidValidator.ts";
import { EventStatusType } from "../types/enums.ts";
import { PudError } from "../types/errors.ts";
import { sendAddExpensesReminderEmails } from "../email-services/notifications/addExpensesReminder.ts";
import { sendReadyToSettleEmails } from "../email-services/notifications/readyToSettle.ts";
import { createDate } from "../utils/dateCreator.ts";
import * as ec from "../types/errorCodes.ts";
import logger from "../utils/logger.ts";

const router = express.Router();

/*
* Send 'add expenses reminder' email to all participants in an event
*/
router.post("/notifications/:eventId/reminder", singleRequestLimiter, authCheck, csrfCheck, async (req, res) => {
  if (!env.MIKANE_EMAIL || !env.MIKANE_EMAIL_API_TOKEN) {
    throw new PudError(ec.PUD073);
  }

  const eventId = req.params.eventId;
  if (!eventId || !isUUID(eventId)) {
    throw new PudError(ec.PUD013);
  }

  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new PudError(ec.PUD055);
  }

  const cutoffDate = req.body.cutoffDate ? createDate(req.body.cutoffDate) : undefined;

  const event = await getEvent(eventId, activeUserId);
  if (!event) {
    throw new PudError(ec.PUD006);
  }
  if (event.status.id !== EventStatusType.ACTIVE) {
    throw new PudError(ec.PUD143);
  }

  const users = await getUsers(activeUserId, { eventId: eventId, excludeGuests: true });

  await sendAddExpensesReminderEmails(users, event, cutoffDate);
  res.status(200).json({ message: "Emails successfully sent" });
});

/*
* Send 'ready-to-settle' email to all participants in an event
*/
router.post("/notifications/:eventId/settle", singleRequestLimiter, authCheck, csrfCheck, async (req, res) => {
  if (!env.MIKANE_EMAIL || !env.MIKANE_EMAIL_API_TOKEN) {
    throw new PudError(ec.PUD073);
  }

  const eventId = req.params.eventId;
  const activeUserId = req.session.userId;
  if (!eventId || !isUUID(eventId)) {
    throw new PudError(ec.PUD013);
  }

  const event = await getEvent(eventId, activeUserId);
  if (!event) {
    throw new PudError(ec.PUD006);
  }
  if (event.status.id !== EventStatusType.READY_TO_SETTLE) {
    throw new PudError(ec.PUD140);
  }

  const payments = await getEventPayments(event.id, activeUserId);

  const currencies = await getCurrencies();
  const currency = currencies.find(c => c.code === event.currency);
  if (!currency) {
    logger.error(`Currency ${event.currency} not found in database for event ${event.name} (${event.id})`);
    throw new PudError(ec.PUD151);
  }

  await sendReadyToSettleEmails(payments, event, currency);
  res.status(200).json({ message: "Emails successfully sent" });
});

export default router;
