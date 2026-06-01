import express from "express";
import * as ec from "../types/errorCodes.ts";
import * as db from "../db/dbValidation.ts";
import { authCheck } from "../middlewares/authCheck.ts";
import { csrfCheck } from "../middlewares/csrf.ts";
import { useRateLimit } from "../middlewares/rateLimiter.ts";
import { isEmail } from "../utils/validators/emailValidator.ts";
import { isUUID } from "../utils/validators/uuidValidator.ts";
import { PudError } from "../types/errors.ts";
import { isValidUsername } from "../utils/validators/usernameValidator.ts";
import { isPhoneNumber } from "../utils/validators/phoneValidator.ts";
const router = express.Router();

/*
* User: Username validation
*/
router.post("/validation/user/username", useRateLimit(), async (req, res) => {
  const username: string = req.body.username;
  const userId: string | undefined = req.body.userId;
  if (!username) {
    throw new PudError(ec.PUD109);
  }
  if (username.trim() === "") {
    throw new PudError(ec.PUD059);
  }
  if (userId !== undefined && !isUUID(userId)) {
    throw new PudError(ec.PUD016);
  }
  if (!isValidUsername(username)) {
    throw new PudError(ec.PUD132);
  }

  const valid = await db.validateUsername(username.trim(), userId);
  if (!valid) {
    throw new PudError(ec.PUD017);
  }
  res.status(200).send({ valid: valid });
});

/*
* User: Email validation
*/
router.post("/validation/user/email", useRateLimit(), async (req, res) => {
  const email: string = req.body.email;
  const userId: string | undefined = req.body.userId;
  if (!email) {
    throw new PudError(ec.PUD110);
  }
  if (!isEmail(email)) {
    throw new PudError(ec.PUD004);
  }
  if (userId !== undefined && !isUUID(userId)) {
    throw new PudError(ec.PUD016);
  }

  const valid = await db.validateEmail(email.trim(), userId);
  if (!valid) {
    throw new PudError(ec.PUD018);
  }
  res.status(200).send({ valid: valid });
});

/*
* User: Phone number validation
*/
router.post("/validation/user/phone", useRateLimit(), async (req, res) => {
  const phoneNumber: string = req.body.phone;
  const userId: string | undefined = req.body.userId;
  if (!phoneNumber) {
    throw new PudError(ec.PUD111);
  }
  if (!isPhoneNumber(phoneNumber)) {
    throw new PudError(ec.PUD113);
  }
  if (userId !== undefined && !isUUID(userId)) {
    throw new PudError(ec.PUD016);
  }

  const valid = await db.validatePhoneNumber(phoneNumber.trim(), userId);
  if (!valid) {
    throw new PudError(ec.PUD019);
  }
  res.status(200).send({ valid: valid });
});

/*
* Event: Name validation
*/
router.post("/validation/event/name", useRateLimit(), authCheck, csrfCheck, async (req, res) => {
  const name: string = req.body.name;
  const eventId: string | undefined = req.body.eventId;
  if (!name) {
    throw new PudError(ec.PUD112);
  }
  if (name.trim() === "") {
    throw new PudError(ec.PUD059);
  }
  if (eventId !== undefined && !isUUID(eventId)) {
    throw new PudError(ec.PUD013);
  }

  const valid = await db.validateEventName(name.trim(), eventId);
  if (!valid) {
    throw new PudError(ec.PUD005);
  }
  res.status(200).send({ valid: valid });
});

/*
* Category: Name validation
*/
router.post("/validation/category/name", useRateLimit(), authCheck, csrfCheck, async (req, res) => {
  const name: string = req.body.name;
  const eventId: string = req.body.eventId;
  const categoryId: string | undefined = req.body.categoryId;
  if (!name) {
    throw new PudError(ec.PUD112);
  }
  if (name.trim() === "") {
    throw new PudError(ec.PUD059);
  }
  if (!isUUID(eventId)) {
    throw new PudError(ec.PUD013);
  }
  if (categoryId !== undefined && !isUUID(categoryId)) {
    throw new PudError(ec.PUD045);
  }

  const valid = await db.validateCategoryName(name.trim(), eventId, categoryId);
  if (!valid) {
    throw new PudError(ec.PUD097);
  }
  res.status(200).send({ valid: valid });
});

export default router;
