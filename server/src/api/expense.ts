import express from "express";
import sql from "mssql";
const router = express.Router();

router.get("/expenses", (req, res, next) => {
  if (!req.query.eventId) {
    return res.status(400).send("EventId not provided!");
  }
  const request = new sql.Request();
  request
    .input("event_id", sql.Int, req.query.eventId)
    .execute("get_expenses")
    .then( (data) => {
      res.send(data.recordset);
    })
    .catch(next);
});

router.post("/expenses", (req, res, next) => {
  if (!req.body.name || !req.body.description || !req.body.categoryId || !req.body.userId) {
    return res.status(400).send("Name, description, categoryId or userId not provided!");
  }
  console.log(req.body.amount);
  const request = new sql.Request();
  request
    .input("name", sql.NVarChar, req.body.name)
    .input("description", sql.NVarChar, req.body.description)
    .input("amount", sql.Numeric(16, 2), req.body.amount)
    .input("category_id", sql.Int, req.body.categoryId)
    .input("user_id", sql.Int, req.body.userId)
    .execute("new_expense")
    .then( (data) => {
      res.send(data.recordset);
    })
    .catch(next);
});

export default router;