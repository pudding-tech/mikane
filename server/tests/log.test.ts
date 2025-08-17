import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/server.ts";
import * as ec from "../src/types/errorCodes.ts";

describe("log", async () => {

  let authToken: string;

  /*
   * Create 1 user, then log in
   */
  beforeAll(async () => {
    await request(app)
      .post("/api/users")
      .send({
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        email: "test@mikane.com",
        phone: "11111111",
        password: "secret"
      });

    const resLogin = await request(app)
      .post("/api/login")
      .send({
        usernameEmail: "testuser",
        password: "secret"
      });

    authToken = resLogin.headers["set-cookie"][0];
  });

  /* --------- */
  /* POST /log */
  /* --------- */
  describe("POST /log", async () => {
    test("fail logging without message", async () => {
      const res = await request(app)
        .post("/api/log")
        .set("Cookie", authToken);

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD144.code);
    });

    test("fail logging with invalid message", async () => {
      const res = await request(app)
        .post("/api/log")
        .set("Cookie", authToken)
        .send({
          message: " ",
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD144.code);
    });

    test("fail logging with invalid level", async () => {
      const res = await request(app)
        .post("/api/log")
        .set("Cookie", authToken)
        .send({
          message: "Test log message",
          level: "invalid"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD145.code);
    });

    test("fail logging with invalid timestamp", async () => {
      const res = await request(app)
        .post("/api/log")
        .set("Cookie", authToken)
        .send({
          message: "Test log message",
          timestamp: "2025-13-01"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD141.code);
    });

    test("should save log to database, without explicit level and timestamp", async () => {
      const res = await request(app)
        .post("/api/log")
        .set("Cookie", authToken)
        .send({
          message: "Test log message"
        });

      expect(res.status).toEqual(200);
      expect(res.body.message).toEqual("Log successfully received");
    });

    test("should save log to database, with explicit level", async () => {
      const res = await request(app)
        .post("/api/log")
        .set("Cookie", authToken)
        .send({
          message: "Test log message",
          level: "info"
        });

      expect(res.status).toEqual(200);
      expect(res.body.message).toEqual("Log successfully received");
    });

    test("should save log to database, with explicit timestamp", async () => {
      const res = await request(app)
        .post("/api/log")
        .set("Cookie", authToken)
        .send({
          message: "Test log message",
          timestamp: "2025-12-01"
        });

      expect(res.status).toEqual(200);
      expect(res.body.message).toEqual("Log successfully received");
    });
  });
});
