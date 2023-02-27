import express from "express";
import * as db from "../db/dbCategories";
import { checkAuth } from "../middleware/authMiddleware";
import { Category } from "../types/types";
const router = express.Router();

/* --- */
/* GET */
/* --- */

// Get a list of all categories for a given event
router.get("/categories", checkAuth, async (req, res, next) => {
  const eventId = Number(req.query.eventId);
  if (!eventId) {
    return res.status(400).json({ error: "EventId not provided" });
  }
  if (isNaN(eventId)) {
    return res.status(400).json({ error: "EventId must be a number" });
  }
  try {
    const categories: Category[] = await db.getCategories(eventId);
    res.send(categories);
  }
  catch (err) {
    next(err);
  }
});

/* ---- */
/* POST */
/* ---- */

// Create a new category
router.post("/categories", checkAuth, async (req, res, next) => {
  if (!req.body.name || !req.body.eventId || req.body.weighted === undefined) {
    return res.status(400).json({ error: "Name, event ID or weighted not provided" });
  }
  try {
    const category: Category = await db.createCategory(req.body.name, req.body.eventId, req.body.weighted);
    res.status(200).send(category);
  }
  catch (err) {
    next(err);
  }
});

// Add a user to a category
router.post("/categories/:catId/user", checkAuth, async (req, res, next) => {
  const catId = Number(req.params.catId);
  const userId = Number(req.body.userId);
  const weight = req.body.weight ? Number(req.body.weight) : undefined;
  if (isNaN(catId)) {
    return res.status(400).json({ error: "Category ID is not a number" });
  }
  if (isNaN(userId)) {
    return res.status(400).json({ error: "User ID is not provided, or is not a number" });
  }
  if ((weight && weight < 1) || (weight && isNaN(weight))) {
    return res.status(400).json({ error: "Weight can not be less than 1" });
  }
  try {
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

// Rename a category
router.put("/categories/:id/name", checkAuth, async (req, res, next) => {
  const catId = Number(req.params.id);
  if (isNaN(catId)) {
    return res.status(400).json({ error: "Category ID must be a number" });
  }
  if (!req.body.name) {
    return res.status(400).json({ error: "Category name not provided" });
  }
  try {
    const category: Category = await db.renameCategory(catId, req.body.name);
    res.status(200).send(category);
  }
  catch (err) {
    next(err);
  }
});

// Edit a user's weight for a category
router.put("/categories/:catId/user/:userId", checkAuth, async (req, res, next) => {
  const catId = Number(req.params.catId);
  const userId = Number(req.params.userId);
  const weight = Number(req.body.weight);
  if (!req.body.weight) {
    return res.status(400).json({ error: "Weight not provided" });
  }
  if (isNaN(catId) || isNaN(userId) || isNaN(weight)) {
    return res.status(400).json({ error: "Category ID, user ID and weight must be numbers" });
  }
  if (weight < 1) {
    return res.status(400).json({ error: "Weight cannot be less than 1" });
  }
  try {
    const category: Category = await db.editUserWeight(catId, userId, req.body.weight);
    res.status(200).send(category);
  }
  catch (err) {
    next(err);
  }
});

// Change weight status for a category (weighted or non-weighted)
router.put("/categories/:catId/weighted", checkAuth, async (req, res, next) => {
  const catId = Number(req.params.catId);
  if (isNaN(catId)) {
    return res.status(400).json({ error: "Category ID and user ID must be numbers" });
  }
  if (req.body.weighted === undefined) {
    return res.status(400).json({ error: "Weighted boolean not provided" });
  }
  try {
    const category: Category = await db.editWeightStatus(catId, req.body.weighted);
    res.status(200).send(category);
  }
  catch (err) {
    next(err);
  }
});

/* ------ */
/* DELETE */
/* ------ */

// Delete a category
router.delete("/categories/:catId", checkAuth, async (req, res, next) => {
  const catId = Number(req.params.catId);
  if (isNaN(catId)) {
    return res.status(400).json({ error: "Category ID must be a number" });
  }
  try {
    const success = await db.deleteCategory(catId);
    res.status(200).send(success);
  }
  catch (err) {
    next(err);
  }
});

// Remove a user from a category
router.delete("/categories/:catId/user/:userId", checkAuth, async (req, res, next) => {
  const catId = Number(req.params.catId);
  const userId = Number(req.params.userId);
  if (isNaN(catId) || isNaN(userId)) {
    return res.status(400).json({ error: "Category ID and user ID must be numbers!" });
  }
  try {
    const category: Category = await db.removeUserFromCategory(catId, userId);
    res.status(200).send(category);
  }
  catch (err) {
    next(err);
  }
});

export default router;
