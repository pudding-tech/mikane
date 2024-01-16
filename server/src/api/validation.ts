import express from "express";
import * as ec from "../types/errorCodes";
import * as db from "../db/dbValidation";
import { authCheck } from "../middlewares/authCheck";
import { isEmail } from "../utils/validators/emailValidator";
import { isUUID } from "../utils/validators/uuidValidator";
import { ErrorExt } from "../types/errorExt";
import { isPhoneNumber } from "../utils/validators/phoneValidator";
const router = express.Router();

/*
* User: Username validation
*/
router.post("/validation/user/username", async (req, res, next) => {
  try {
    const username: string = req.body.username;
    const userId: string | undefined = req.body.userId;
    if (!username) {
      throw new ErrorExt(ec.PUD109);
    }
    if (username.trim() === "") {
      throw new ErrorExt(ec.PUD059);
    }
    if (userId !== undefined && !isUUID(userId)) {
      throw new ErrorExt(ec.PUD016);
    }

    const valid = await db.validateUsername(username.trim(), userId);
    if (!valid) {
      throw new ErrorExt(ec.PUD017);
    }
    res.status(200).send({ valid: valid });
  }
  catch (err) {
    next(err);
  }
});

/*
* User: Email validation
*/
router.post("/validation/user/email", async (req, res, next) => {
  try {
    const email: string = req.body.email;
    const userId: string | undefined = req.body.userId;
    if (!email) {
      throw new ErrorExt(ec.PUD110);
    }
    if (!isEmail(email)) {
      throw new ErrorExt(ec.PUD004);
    }
    if (userId !== undefined && !isUUID(userId)) {
      throw new ErrorExt(ec.PUD016);
    }

    const valid = await db.validateEmail(email.trim(), userId);
    if (!valid) {
      throw new ErrorExt(ec.PUD018);
    }
    res.status(200).send({ valid: valid });
  }
  catch (err) {
    next(err);
  }
});

/*
* User: Phone number validation
*/
router.post("/validation/user/phone", async (req, res, next) => {
  try {
    const phoneNumber: string = req.body.phone;
    const userId: string | undefined = req.body.userId;
    if (!phoneNumber) {
      throw new ErrorExt(ec.PUD111);
    }
    if (!isPhoneNumber(phoneNumber)) {
      throw new ErrorExt(ec.PUD113);
    }
    if (userId !== undefined && !isUUID(userId)) {
      throw new ErrorExt(ec.PUD016);
    }

    const valid = await db.validatePhoneNumber(phoneNumber.trim(), userId);
    if (!valid) {
      throw new ErrorExt(ec.PUD019);
    }
    res.status(200).send({ valid: valid });
  }
  catch (err) {
    next(err);
  }
});

/*
* Event: Name validation
*/
router.post("/validation/event/name", authCheck, async (req, res, next) => {
  try {
    const name: string = req.body.name;
    const eventId: string | undefined = req.body.eventId;
    if (!name) {
      throw new ErrorExt(ec.PUD112);
    }
    if (name.trim() === "") {
      throw new ErrorExt(ec.PUD059);
    }
    if (eventId !== undefined && !isUUID(eventId)) {
      throw new ErrorExt(ec.PUD013);
    }

    const valid = await db.validateEventName(name.trim(), eventId);
    if (!valid) {
      throw new ErrorExt(ec.PUD005);
    }
    res.status(200).send({ valid: valid });
  }
  catch (err) {
    next(err);
  }
});

/*
* Category: Name validation
*/
router.post("/validation/category/name", authCheck, async (req, res, next) => {
  try {
    const name: string = req.body.name;
    const eventId: string = req.body.eventId;
    const categoryId: string | undefined = req.body.categoryId;
    if (!name) {
      throw new ErrorExt(ec.PUD112);
    }
    if (name.trim() === "") {
      throw new ErrorExt(ec.PUD059);
    }
    if (!isUUID(eventId)) {
      throw new ErrorExt(ec.PUD013);
    }
    if (categoryId !== undefined && !isUUID(categoryId)) {
      throw new ErrorExt(ec.PUD045);
    }

    const valid = await db.validateCategoryName(name.trim(), eventId, categoryId);
    if (!valid) {
      throw new ErrorExt(ec.PUD097);
    }
    res.status(200).send({ valid: valid });
  }
  catch (err) {
    next(err);
  }
});

export default router;
