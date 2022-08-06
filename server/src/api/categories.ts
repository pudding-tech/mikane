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
    .input("category_id", sql.Int, null)
    .execute("get_categories")
    .then( (data) => {
      const categories: Category[] = parseCategories(data.recordset, "client");
      res.send(categories);
    })
    .catch(next);
});

router.post("/categories", (req, res, next) => {
  if (!req.body.name || !req.body.eventId || req.body.weighted === undefined) {
    return res.status(400).send("Name, event ID or weighted not provided!");
  }
  const request = new sql.Request();
  request
    .input("name", sql.NVarChar, req.body.name)
    .input("event_id", sql.Int, req.body.eventId)
    .input("weighted", sql.Bit, req.body.weighted)
    .execute("new_category")
    .then( (data) => {
      res.send(data.recordset[0]);
    })
    .catch(next);
});

router.delete("/categories/:catId", (req, res, next) => {
  const catId = Number(req.params.catId);
  if (isNaN(catId)) {
    return res.status(400).send("Category ID must be a number!");
  }
  const request = new sql.Request();
  request
    .input("category_id", sql.Int, catId)
    .execute("delete_category")
    .then( () => {
      res.send({});
    })
    .catch(next);
});

router.post("/categories/:catId/user", (req, res) => {
  const catId = Number(req.params.catId);
  if (isNaN(catId)) {
    return res.status(400).send("Category ID is not a number!");
  }
  if (!req.body.userId) {
    return res.status(400).send("UserId not provided!");
  }
  if (req.body.weight < 1) {
    return res.status(400).send("Weight can not be less than 1!");
  }
  const request = new sql.Request();
  request
    .input("category_id", sql.Int, catId)
    .input("user_id", sql.Int, req.body.userId)
    .input("weight", sql.Numeric(14), req.body.weight)
    .execute("add_user_to_category")
    .then( (data) => {
      const categories: Category[] = parseCategories(data.recordset, "client");
      res.send(categories[0]);
    })
    .catch(() => res.status(400).send("Weight required when adding user to weighted category"));
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
      const categories: Category[] = parseCategories(data.recordset, "client");
      res.send(categories[0]);
    })
    .catch(next);
});

router.put("/categories/:catId/user/:userId", (req, res, next) => {
  const catId = Number(req.params.catId);
  const userId = Number(req.params.userId);
  if (isNaN(catId) || isNaN(userId)) {
    return res.status(400).send("Category ID and user ID must be numbers!");
  }
  if (!req.body.weight) {
    return res.status(400).send("Weight not provided!");
  }
  if (req.body.weight < 1) {
    return res.status(400).send("Weight can not be less than 1!");
  }
  const request = new sql.Request();
  request
    .input("category_id", sql.Int, catId)
    .input("user_id", sql.Int, userId)
    .input("weight", sql.Int, req.body.weight)
    .execute("edit_user_weight")
    .then( (data) => {
      const categories: Category[] = parseCategories(data.recordset, "client");
      res.send(categories[0]);
    })
    .catch(next);
});

router.put("/categories/:catId/weighted", (req, res, next) => {
  const catId = Number(req.params.catId);
  if (isNaN(catId)) {
    return res.status(400).send("Category ID and user ID must be numbers!");
  }
  if (req.body.weighted === undefined) {
    return res.status(400).send("Weighted boolean not provided!");
  }
  const request = new sql.Request();
  request
    .input("category_id", sql.Int, catId)
    .input("weighted", sql.Bit, req.body.weighted)
    .execute("edit_category_weighted_status")
    .then( (data) => {
      const categories: Category[] = parseCategories(data.recordset, "client");
      res.send(categories[0]);
    })
    .catch(next);
});

export default router;