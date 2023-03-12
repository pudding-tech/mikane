import express from "express";
import * as db from "../db/dbCategories";
import { checkAuth } from "../middleware/authMiddleware";
import { Category } from "../types/types";
import * as ec from "../types/errorCodes";
const router = express.Router();

/* --- */
/* GET */
/* --- */

// Get a list of all categories for a given event
router.get("/categories", checkAuth, async (req, res, next) => {
  const eventId = Number(req.query.eventId);
  if (isNaN(eventId)) {
    return res.status(400).json(ec.PUD013);
  }
  try {
    const categories: Category[] = await db.getCategories(eventId);
    res.send(categories);
  }
  catch (err) {
    next(err);
  }
});

// Get a specific category
router.get("/categories/:id", checkAuth, async (req, res, next) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json(ec.PUD045);
  }
  try {
    const category: Category = await db.getCategory(id);
    res.send(category);
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
    return res.status(400).json(ec.PUD046);
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
router.post("/categories/:id/user/:userId", checkAuth, async (req, res, next) => {
  const catId = Number(req.params.id);
  const userId = Number(req.params.userId);
  const weight = req.body.weight ? Number(req.body.weight) : undefined;

  if (isNaN(catId) || isNaN(userId)) {
    return res.status(400).json(ec.PUD047);
  }
  if (weight && isNaN(weight)) {
    return res.status(400).json(ec.PUD048);
  }
  if (weight && weight < 1) {
    return res.status(400).json(ec.PUD049);
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
router.put("/categories/:id", checkAuth, async (req, res, next) => {
  const catId = Number(req.params.id);
  if (isNaN(catId)) {
    return res.status(400).json(ec.PUD045);
  }
  if (!req.body.name) {
    return res.status(400).json(ec.PUD050);
  }
  try {
    const category: Category = await db.renameCategory(catId, req.body.name);
    res.status(200).send(category);
  }
  catch (err) {
    next(err);
  }
});

// Change weight status for a category (weighted or non-weighted)
router.put("/categories/:id/weighted", checkAuth, async (req, res, next) => {
  const catId = Number(req.params.id);
  if (isNaN(catId)) {
    return res.status(400).json(ec.PUD045);
  }
  if (typeof(req.body.weighted) !== "boolean") {
    return res.status(400).json(ec.PUD051);
  }
  try {
    const category: Category = await db.editWeightStatus(catId, Boolean(req.body.weighted));
    res.status(200).send(category);
  }
  catch (err) {
    next(err);
  }
});

// Edit a user's weight for a category
router.put("/categories/:id/user/:userId", checkAuth, async (req, res, next) => {
  const catId = Number(req.params.id);
  const userId = Number(req.params.userId);
  const weight = req.body.weight ? Number(req.body.weight) : undefined;

  if (isNaN(catId) || isNaN(userId)) {
    return res.status(400).json(ec.PUD047);
  }
  if (!weight || isNaN(weight)) {
    return res.status(400).json(ec.PUD048);
  }
  if (weight < 1) {
    return res.status(400).json(ec.PUD049);
  }
  try {
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

// Delete a category
router.delete("/categories/:id", checkAuth, async (req, res, next) => {
  const catId = Number(req.params.id);
  if (isNaN(catId)) {
    return res.status(400).json(ec.PUD045);
  }
  try {
    const success = await db.deleteCategory(catId);
    res.status(200).send({ success: success });
  }
  catch (err) {
    next(err);
  }
});

// Remove a user from a category
router.delete("/categories/:id/user/:userId", checkAuth, async (req, res, next) => {
  const catId = Number(req.params.id);
  const userId = Number(req.params.userId);
  if (isNaN(catId) || isNaN(userId)) {
    return res.status(400).json(ec.PUD047);
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
