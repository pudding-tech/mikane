import express from "express";
import * as db from "../db/dbCategories";
import { authCheck } from "../middlewares/authCheck";
import { Category } from "../types/types";
import { ErrorExt } from "../types/errorExt";
import * as ec from "../types/errorCodes";
const router = express.Router();

/* --- */
/* GET */
/* --- */

/*
* Get a list of all categories for a given event
*/
router.get("/categories", authCheck, async (req, res, next) => {
  try {
    const eventId = Number(req.query.eventId);
    if (isNaN(eventId)) {
      throw new ErrorExt(ec.PUD013);
    }

    const categories: Category[] = await db.getCategories(eventId);
    res.send(categories);
  }
  catch (err) {
    next(err);
  }
});

/*
* Get a specific category
*/
router.get("/categories/:id", authCheck, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      throw new ErrorExt(ec.PUD045);
    }

    const category = await db.getCategory(id);
    if (!category) {
      throw new ErrorExt(ec.PUD007);
    }
    res.status(200).json(category);
  }
  catch (err) {
    next(err);
  }
});

/* ---- */
/* POST */
/* ---- */

/*
* Create a new category
*/
router.post("/categories", authCheck, async (req, res, next) => {
  try {
    if (!req.body.name || !req.body.eventId || req.body.weighted === undefined) {
      throw new ErrorExt(ec.PUD046);
    }

    const category: Category = await db.createCategory(req.body.name, req.body.eventId, req.body.weighted);
    res.status(200).json(category);
  }
  catch (err) {
    next(err);
  }
});

/*
* Add a user to a category
*/
router.post("/categories/:id/user/:userId", authCheck, async (req, res, next) => {
  try {
    const catId = Number(req.params.id);
    const userId = Number(req.params.userId);
    const weight = req.body.weight ? Number(req.body.weight) : undefined;

    if (isNaN(catId) || isNaN(userId)) {
      throw new ErrorExt(ec.PUD047);
    }
    if (weight && isNaN(weight)) {
      throw new ErrorExt(ec.PUD048);
    }
    if (weight && weight < 1) {
      throw new ErrorExt(ec.PUD049);
    }

    const category: Category = await db.addUserToCategory(catId, userId, weight);
    res.send(category);
  }
  catch (err) {
    next(err);
  }
});

/* --- */
/* PUT */
/* --- */

/*
* Rename a category
*/
router.put("/categories/:id", authCheck, async (req, res, next) => {
  try {
    const catId = Number(req.params.id);
    if (isNaN(catId)) {
      throw new ErrorExt(ec.PUD045);
    }
    if (!req.body.name) {
      throw new ErrorExt(ec.PUD050);
    }

    const category = await db.renameCategory(catId, req.body.name);
    if (!category) {
      throw new ErrorExt(ec.PUD007);
    }
    res.status(200).send(category);
  }
  catch (err) {
    next(err);
  }
});

/*
* Change weight status for a category (weighted or non-weighted)
*/
router.put("/categories/:id/weighted", authCheck, async (req, res, next) => {
  try {
    const catId = Number(req.params.id);
    if (isNaN(catId)) {
      throw new ErrorExt(ec.PUD045);
    }
    if (typeof(req.body.weighted) !== "boolean") {
      throw new ErrorExt(ec.PUD051);
    }

    const category: Category = await db.editWeightStatus(catId, Boolean(req.body.weighted));
    res.status(200).send(category);
  }
  catch (err) {
    next(err);
  }
});

/*
* Edit a user's weight for a category
*/
router.put("/categories/:id/user/:userId", authCheck, async (req, res, next) => {
  try {
    const catId = Number(req.params.id);
    const userId = Number(req.params.userId);
    const weight = req.body.weight ? Number(req.body.weight) : undefined;

    if (isNaN(catId) || isNaN(userId)) {
      throw new ErrorExt(ec.PUD047);
    }
    if (!weight || isNaN(weight)) {
      throw new ErrorExt(ec.PUD048);
    }
    if (weight < 1) {
      throw new ErrorExt(ec.PUD049);
    }

    const category: Category = await db.editUserWeight(catId, userId, weight);
    res.status(200).send(category);
  }
  catch (err) {
    next(err);
  }
});

/* ------ */
/* DELETE */
/* ------ */

/*
* Delete a category
*/
router.delete("/categories/:id", authCheck, async (req, res, next) => {
  try {
    const catId = Number(req.params.id);
    if (isNaN(catId)) {
      throw new ErrorExt(ec.PUD045);
    }

    const success = await db.deleteCategory(catId);
    res.status(200).send({ success: success });
  }
  catch (err) {
    next(err);
  }
});

/*
* Remove a user from a category
*/
router.delete("/categories/:id/user/:userId", authCheck, async (req, res, next) => {
  try {
    const catId = Number(req.params.id);
    const userId = Number(req.params.userId);
    if (isNaN(catId) || isNaN(userId)) {
      throw new ErrorExt(ec.PUD047);
    }

    const category: Category = await db.removeUserFromCategory(catId, userId);
    res.status(200).send(category);
  }
  catch (err) {
    next(err);
  }
});

export default router;
