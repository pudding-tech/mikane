import express from "express";
import sql from "mssql";
import { Category } from "../types";
import { parseCategories } from "../parsers";
const router = express.Router();

router.get("/categories", (req, res, next) => {
  if (!req.query.eventId) {
    return res.status(400).send("EventId not provided!");
  }
  const request = new sql.Request();
  request
    .input("event_id", sql.Int, req.query.eventId)
    .execute("get_categories")
    .then( (data) => {
      console.log(data.recordset);
      const categories: Category[] = parseCategories(data.recordset);
      res.send(categories);
    })
    .catch(next);
});

router.post("/categories", (req, res, next) => {
  if (!req.body.name || !req.body.eventId) {
    return res.status(400).send("Name or eventId not provided!");
  }
  const request = new sql.Request();
  request
    .input("name", sql.NVarChar, req.body.name)
    .input("event_id", sql.Int, req.body.eventId)
    .execute("new_category")
    .then( (data) => {
      res.send(data.recordset);
    })
    .catch(next);
});

router.post("/categories/:catId/user", (req, res, next) => {
  const catId = Number(req.params.catId);
  if (isNaN(catId)) {
    return res.status(400).send("Category ID is not a number!");
  }
  if (!req.body.userId || !req.body.weight) {
    return res.status(400).send("UserId or weight not provided!");
  }
  const request = new sql.Request();
  request
    .input("category_id", sql.Int, catId)
    .input("user_id", sql.Int, req.body.userId)
    .input("weight", sql.Numeric(14), req.body.weight)
    .execute("add_user_to_category")
    .then( (data) => {
      const categories: Category[] = parseCategories(data.recordset);
      res.send(categories);
    })
    .catch(next);
});

router.delete("/categories/:catId/user/:userId", (req, res, next) => {
  const catId = Number(req.params.catId);
  const userId = Number(req.params.userId);
  if (isNaN(catId) || isNaN(userId)) {
    return res.status(400).send("Category ID and user ID must be numbers!");
  }
  const request = new sql.Request();
  request
    .input("category_id", sql.Int, catId)
    .input("user_id", sql.Int, userId)
    .execute("remove_user_from_category")
    .then( (data) => {
      const categories: Category[] = parseCategories(data.recordset);
      res.send(categories);
    })
    .catch(next);
});

export default router;