import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "./setup";
import * as ec from "../src/types/errorCodes";

describe("events", () => {

  let authToken: any;

  beforeAll(async () => {
    await request(app)
      .post("/api/users")
      .send({
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        email: "test@user.com",
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

  describe("POST /events", async () => {
    test("create event", async () => {
      const res = await request(app)
        .post("/api/events")
        .set("Cookie", authToken)
        .send({
          name: "Example event",
          description: "Example description",
          private: false
        });

      expect(res.status).toEqual(200);
      expect(res.body).toBeDefined();
    });

    test("create event with taken name", async () => {
      const res = await request(app)
        .post("/api/events")
        .set("Cookie", authToken)
        .send({
          name: "Example event",
          description: "Example description",
          private: false
        });

      expect(res.status).toEqual(409);
      expect(res.body.code).toEqual(ec.PUD005.code);
    });
  });

  describe("GET /events", async () => {
    test("should get events", async () => {
      const res = await request(app)
        .get("/api/events")
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: "Example event" })
        ])
      );
    });
  });
});
