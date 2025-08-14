import { afterAll } from "vitest";
import { resetDatabase } from "./resetDatabase.ts";
import "./mocks/postmarkMock.ts"; // Ensure postmark mock is loaded

afterAll(async () => {
  try {
    await resetDatabase();
  }
  catch (err) {
    console.log("Something went wrong resetting DB");
    console.log(err);
  }
});
