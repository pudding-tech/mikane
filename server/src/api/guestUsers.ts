import express from "express";
import * as db from "../db/dbGuestUsers";
import * as ec from "../types/errorCodes";
import { randomUUID } from "crypto";
import { authCheck } from "../middlewares/authCheck";
import { Guest } from "../types/types";
import { ErrorExt } from "../types/errorExt";
import { isUUID } from "../utils/validators/uuidValidator";
const router = express.Router();

/* --- */
/* GET */
/* --- */

/*
* Get a list of all guest users
*/
router.get("/guests", authCheck, async (_req, res, next) => {
  try {
    const guestUsers: Guest[] = await db.getGuestUsers();
    res.status(200).send(guestUsers);
  }
  catch (err) {
    next(err);
  }
});

/* ---- */
/* POST */
/* ---- */

/*
* Create new guest user
*/
router.post("/guests", authCheck, async (req, res, next) => {
  try {
    const firstName: string = req.body.firstName;
    const lastName: string = req.body.lastName;
    const id = randomUUID();

    const byUserId = req.session.userId;
    if (!byUserId) {
      throw new ErrorExt(ec.PUD055);
    }

    if (!firstName || firstName.trim() === "") {
      throw new ErrorExt(ec.PUD121);
    }

    const guestUser: Guest = await db.createGuestUser(id, firstName, lastName, byUserId);
    res.status(200).json(guestUser);
  }
  catch (err) {
    next(err);
  }
});

/* --- */
/* PUT */
/* --- */

/*
* Edit guest user
*/
router.put("/guests/:id", authCheck, async (req, res, next) => {
  try {
    const guestId = req.params.id;
    if (!isUUID(guestId)) {
      throw new ErrorExt(ec.PUD016);
    }
    const byUserId = req.session.userId;
    if (!byUserId) {
      throw new ErrorExt(ec.PUD055);
    }

    const firstName: string | undefined = req.body.firstName;
    const lastName: string | undefined = req.body.lastName;

    if (!firstName && !lastName) {
      throw new ErrorExt(ec.PUD058);
    }
    if (firstName?.trim() === "") {
      throw new ErrorExt(ec.PUD059);
    }
    
    const data = {
      firstName: firstName,
      lastName: lastName
    };

    const guestUser = await db.editGuestUser(guestId, data, byUserId);
    if (!guestUser) {
      throw new ErrorExt(ec.PUD122);
    }
    res.status(200).send(guestUser);
  }
  catch (err) {
    next(err);
  }
});

/* ------ */
/* DELETE */
/* ------ */

/*
* Delete guest user
*/
router.delete("/guests/:id", authCheck, async (req, res, next) => {
  try {
    const guestId = req.params.id;
    if (!isUUID(guestId)) {
      throw new ErrorExt(ec.PUD016);
    }
    const byUserId = req.session.userId;
    if (!byUserId) {
      throw new ErrorExt(ec.PUD055);
    }

    const success = await db.deleteGuestUser(guestId, byUserId);
    res.status(200).send({ success: success });
  }
  catch (err) {
    next(err);
  }
});

export default router;
