import { Application } from "express";
import app from "../src/server";
import { afterAll, beforeAll } from "vitest";
import { resetDatabase } from "./resetDatabase";

export const waitForDB = async (app: Application) => {
  return new Promise<void>((resolve, reject) => {
    if (app.get("dbReady")) {
      resolve();
    }
    else if (app.get("dbReady") === false) {
      reject();
    }
    else {
      app.on("dbConnected", () => {
        resolve();
      });
      app.on("dbConnectionError", () => {
        reject();
      });
    }
  });
};

beforeAll(async () => {
  try {
    await waitForDB(app);
  }
  catch (err) {
    console.log("Something went wrong waiting for database to connect");
    console.log(err);
    process.exit();
  }
});

afterAll(async () => {
  try {
    await resetDatabase();
  }
  catch (err) {
    console.log("Something went wrong resetting DB");
    console.log(err);
  }
});

export default app;
