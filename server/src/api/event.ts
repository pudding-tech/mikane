import express from "express";
import sql from "mssql";
const eventRouter = express.Router();

eventRouter.get("/events", (req, res, next) => {
  console.log("Get all events");
  const request = new sql.Request();
  request
    .input("name", sql.NVarChar, null)
    .execute("get_events")
    .then( (data) => {
      console.log(data.recordset);
      res.send(data.recordset);
    })
    .catch(next);
});

export default eventRouter;