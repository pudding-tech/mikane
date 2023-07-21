import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "./setup";
import * as ec from "../src/types/errorCodes";
import { User } from "../src/types/types";

describe("authentication", async () => {

  let authToken: string;
  let user: User;

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

    test("should log in already logged in user", async () => {
      const res = await request(app)
        .post("/api/login")
        .set("Cookie", authToken)
        .send({
          usernameEmail: "testuser",
          password: "secret"
        });

      expect(res.status).toEqual(200);
      expect(res.body.username).toEqual(user.username);
    });

    test("fail login with wrong password", async () => {
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

    test("should not be authenticated", async () => {
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

  /* -------------------------- */
  /* POST /requestpasswordreset */
  /* -------------------------- */
  describe("POST /requestpasswordreset", async () => {
    test("fail when requesting password reset", async () => {
      const res = await request(app)
        .post("/api/requestpasswordreset")
        .send({
          email: "a@mikane.no"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD073.code);
    });
  });

  /* ----------------- */
  /* POST /generatekey */
  /* ----------------- */
  describe("POST /generatekey", async () => {
    test("should create new API key", async () => {
      const res = await request(app)
        .post("/api/generatekey")
        .set("Authorization", "886a2ef41eedfa5bb9978268965a645e")
        .send({
          name: "Common key for testing"
        });

      expect(res.status).toEqual(200);
      expect(res.body).toBeDefined();
    });

    test("fail when creating API key without master key", async () => {
      const res = await request(app)
        .post("/api/generatekey")
        .send({
          name: "Common key for testing2"
        });

      expect(res.status).toEqual(401);
      expect(res.body.code).toEqual(ec.PUD069.code);
    });
  });
});
