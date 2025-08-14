import express from "express";
import * as db from "../db/dbCategories.ts";
import { authCheck } from "../middlewares/authCheck.ts";
import { isUUID } from "../utils/validators/uuidValidator.ts";
import { Category } from "../types/types.ts";
import { CategoryIcon } from "../types/enums.ts";
import { ErrorExt } from "../types/errorExt.ts";
import * as ec from "../types/errorCodes.ts";
const router = express.Router();

/* --- */
/* GET */
/* --- */

/*
* Get a list of all categories for a given event
*/
router.get("/categories", authCheck, async (req, res) => {
  const eventId = req.query.eventId as string;
  const activeUserId = req.session.userId;

  if (!isUUID(eventId)) {
    throw new ErrorExt(ec.PUD013);
  }
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD055);
  }

  const categories: Category[] = await db.getCategories(eventId, activeUserId);
  res.send(categories);
});

/*
* Get a specific category
*/
router.get("/categories/:id", authCheck, async (req, res) => {
  const id = req.params.id;
  const activeUserId = req.session.userId;

  if (!isUUID(id)) {
    throw new ErrorExt(ec.PUD045);
  }
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD055);
  }

  const category = await db.getCategory(id, activeUserId);
  if (!category) {
    throw new ErrorExt(ec.PUD007);
  }
  res.status(200).json(category);
});

/* ---- */
/* POST */
/* ---- */

/*
* Create a new category
*/
router.post("/categories", authCheck, async (req, res) => {
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
  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD055);
  }

  const icon: CategoryIcon = req.body.icon;
  if (icon && !Object.values(CategoryIcon).includes(icon)) {
    throw new ErrorExt(ec.PUD096);
  }
  
  const category: Category = await db.createCategory(name.trim(), eventId, Boolean(req.body.weighted), activeUserId, icon);
  res.status(200).json(category);
});

/*
* Add a user to a category
*/
router.post("/categories/:id/user/:userId", authCheck, async (req, res) => {
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

  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD055);
  }

  const category: Category = await db.addUserToCategory(catId, userId, activeUserId, weight);
  res.send(category);
});

/* --- */
/* PUT */
/* --- */

/*
* Edit a category
*/
router.put("/categories/:id", authCheck, async (req, res) => {
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

  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD055);
  }

  const data = {
    name: name,
    icon: icon
  };

  const category = await db.editCategory(catId, activeUserId, data);
  if (!category) {
    throw new ErrorExt(ec.PUD007);
  }
  res.status(200).send(category);
});

/*
* Change weight status for a category (weighted or non-weighted)
*/
router.put("/categories/:id/weighted", authCheck, async (req, res) => {
  const catId = req.params.id;
  if (!isUUID(catId)) {
    throw new ErrorExt(ec.PUD045);
  }
  if (typeof(req.body.weighted) !== "boolean") {
    throw new ErrorExt(ec.PUD051);
  }

  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD055);
  }

  const category: Category = await db.editWeightStatus(catId, Boolean(req.body.weighted), activeUserId);
  res.status(200).send(category);
});

/*
* Edit a user's weight for a category
*/
router.put("/categories/:id/user/:userId", authCheck, async (req, res) => {
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

  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD055);
  }

  const category: Category = await db.editUserWeight(catId, userId, weight, activeUserId);
  res.status(200).send(category);
});

/* ------ */
/* DELETE */
/* ------ */

/*
* Delete a category
*/
router.delete("/categories/:id", authCheck, async (req, res) => {
  const catId = req.params.id;
  if (!isUUID(catId)) {
    throw new ErrorExt(ec.PUD045);
  }

  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD055);
  }

  const success = await db.deleteCategory(catId, activeUserId);
  res.status(200).send({ success: success });
});

/*
* Remove a user from a category
*/
router.delete("/categories/:id/user/:userId", authCheck, async (req, res) => {
  const catId = req.params.id;
  const userId = req.params.userId;
  if (!isUUID(catId) || !isUUID(userId)) {
    throw new ErrorExt(ec.PUD047);
  }

  const activeUserId = req.session.userId;
  if (!activeUserId) {
    throw new ErrorExt(ec.PUD055);
  }

  const category: Category = await db.removeUserFromCategory(catId, userId, activeUserId);
  res.status(200).send(category);
});

export default router;
