import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "./setup";
import * as ec from "../src/types/errorCodes";
import { User } from "../src/types/types";

describe("authentication", async () => {

  let user: User;
  let authToken: string;

  /*
   * Create user
   */
  beforeAll(async () => {
    const resUser = await request(app)
      .post("/api/users")
      .send({
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        email: "test@user.com",
        phone: "11111111",
        password: "secret"
      });

    user = resUser.body;
  });

  /* ----------- */
  /* POST /login */
  /* ----------- */
  describe("POST /login", async () => {
    test("should log in", async () => {
      const res = await request(app)
        .post("/api/login")
        .send({
          usernameEmail: "testuser",
          password: "secret"
        });

      expect(res.status).toEqual(200);
      expect(res.body.username).toEqual(user.username);
      expect(res.headers["set-cookie"]).toBeDefined();
      authToken = res.headers["set-cookie"][0];
    });

    test("should fail login with wrong password", async () => {
      const res = await request(app)
        .post("/api/login")
        .send({
          usernameEmail: "testuser",
          password: "wrongsecret"
        });

      expect(res.headers["set-cookie"]).toBeUndefined();
      expect(res.status).toEqual(401);
    });
  });

  /* ---------- */
  /* GET /login */
  /* ---------- */
  describe("GET /login", async () => {
    test("should return logged in user", async () => {
      const res = await request(app)
        .get("/api/login")
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.username).toEqual(user.username);
    });

    test("should be not authenticated", async () => {
      const res = await request(app)
        .get("/api/login");

      expect(res.status).toEqual(401);
      expect(res.body.code).toEqual(ec.PUD001.code);
    });
  });

  /* ------------ */
  /* POST /logout */
  /* ------------ */
  describe("POST /logout", async () => {
    test("should log out user", async () => {
      const res = await request(app)
        .post("/api/logout")
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
    });
  });

  /* ----------------- */
  /* POST /generatekey */
  /* ----------------- */
  describe("POST /generatekey", async () => {
    test("fail when creating API key without master key", async () => {
      const res = await request(app)
        .post("/api/generatekey")
        .send({
          name: "Testkey"
        });

      expect(res.status).toEqual(401);
      expect(res.body.code).toEqual(ec.PUD069.code);
    });
  });
});
