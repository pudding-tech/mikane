import express from "express";
import sql from "mssql";
const userRouter = express.Router();

userRouter.get("/users", (req, res, next) => {
  const request = new sql.Request();
  request
    .input("event_id", sql.Int, req.query.eventId)
    .execute("get_users")
    .then( (data) => {
      console.log(data.recordset);
      res.send(data.recordset);
    })
    .catch(next);
});

userRouter.post("/users", (req, res, next) => {
  if (!req.body.name || !req.body.eventId) {
    return res.status(400).send("Name or eventId not provided!");
  }
  console.log("NEW USER");
  const request = new sql.Request();
  request
    .input("name", sql.NVarChar, req.body.name)
    .input("event_id", sql.Int, req.body.eventId)
    .execute("new_user")
    .then( (data) => {
      res.send(data.recordset);
    })
    .catch(next);
});

userRouter.post("/eventUsers", (req, res, next) => {
  if (!req.body.eventId || !req.body.userId) {
    return res.status(400).send("EventId or userId not provided!");
  }
  const request = new sql.Request();
  request
    .input("event_id", sql.Int, req.body.eventId)
    .input("user_id", sql.Int, req.body.userId)
    .execute("new_user_in_event")
    .then( (data) => {
      res.send(data.recordset);
    })
    .catch(next);
});

export default userRouter;