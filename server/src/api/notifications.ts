import express from "express";
import env from "../env.ts";
import * as dbEvents from "../db/dbEvents.ts";
import { authCheck } from "../middlewares/authCheck.ts";
import { isUUID } from "../utils/validators/uuidValidator.ts";
import { EventStatusType } from "../types/enums.ts";
import { ErrorExt } from "../types/errorExt.ts";
import { sendReadyToSettleEmails } from "../email-services/notifications/readyToSettle.ts";
import * as ec from "../types/errorCodes.ts";
const router = express.Router();

/*
* Send 'ready-to-settle' email to all payers in an event
*/
router.post("/notifications/:eventId/settle", authCheck, async (req, res) => {
  if (!env.MIKANE_EMAIL || !env.MIKANE_EMAIL_PASSWORD) {
    throw new ErrorExt(ec.PUD073);
  }

  const eventId = req.params.eventId;
  const activeUserId = req.session.userId;
  if (!isUUID(eventId)) {
    throw new ErrorExt(ec.PUD013);
  }

  const event = await dbEvents.getEvent(eventId, activeUserId);
  if (!event) {
    throw new ErrorExt(ec.PUD006);
  }
  if (event.status.id !== EventStatusType.READY_TO_SETTLE) {
    throw new ErrorExt(ec.PUD140);
  }

  const payments = await dbEvents.getEventPayments(event.id, activeUserId);

  await sendReadyToSettleEmails(payments, event);
  res.status(200).json({ message: "Emails successfully sent" });
});

export default router;
