import express from "express";
import * as db from "../db/dbCategories";
import { authCheck } from "../middlewares/authCheck";
import { isUUID } from "../utils/validators/uuidValidator";
import { Category } from "../types/types";
import { CategoryIcon } from "../types/enums";
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
    const eventId = req.query.eventId as string;
    if (!isUUID(eventId)) {
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
    const id = req.params.id;
    if (!isUUID(id)) {
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
    const name: string = req.body.name;
    if (!name || !req.body.eventId || req.body.weighted === undefined) {
      throw new ErrorExt(ec.PUD046);
    }
    if (name.trim() === "") {
      throw new ErrorExt(ec.PUD059);
    }
    const eventId = req.body.eventId as string;
    if (!isUUID(eventId)) {
      throw new ErrorExt(ec.PUD013);
    }

    const icon: CategoryIcon = req.body.icon;
    if (icon && !Object.values(CategoryIcon).includes(icon)) {
      throw new ErrorExt(ec.PUD096);
    }
    
    const category: Category = await db.createCategory(name.trim(), eventId, Boolean(req.body.weighted), icon);
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
    const catId = req.params.id;
    const userId = req.params.userId;
    const weight = req.body.weight ? Number(req.body.weight) : undefined;

    if (!isUUID(catId) || !isUUID(userId)) {
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
* Edit a category
*/
router.put("/categories/:id", authCheck, async (req, res, next) => {
  try {
    const catId = req.params.id;
    if (!isUUID(catId)) {
      throw new ErrorExt(ec.PUD045);
    }

    const name: string | undefined = req.body.name;
    const icon: CategoryIcon | undefined = req.body.icon;
    if (!name && !icon) {
      throw new ErrorExt(ec.PUD115);
    }
    if (name && name.trim() === "") {
      throw new ErrorExt(ec.PUD059);
    }
    if (icon && !Object.values(CategoryIcon).includes(icon)) {
      throw new ErrorExt(ec.PUD096);
    }

    const data = {
      name: name,
      icon: icon
    };

    const category = await db.editCategory(catId, data);
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
    const catId = req.params.id;
    if (!isUUID(catId)) {
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
    const catId = req.params.id;
    const userId = req.params.userId;
    const weight = req.body.weight ? Number(req.body.weight) : undefined;

    if (!isUUID(catId) || !isUUID(userId)) {
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
    const catId = req.params.id;
    if (!isUUID(catId)) {
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
    const catId = req.params.id;
    const userId = req.params.userId;
    if (!isUUID(catId) || !isUUID(userId)) {
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
