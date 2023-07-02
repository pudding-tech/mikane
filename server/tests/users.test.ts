import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "./setup";
import * as ec from "../src/types/errorCodes";
import { User } from "../src/types/types";

describe("users", async () => {

  let user: User;
  let authToken: any;

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

    const resLogin = await request(app)
      .post("/api/login")
      .send({
        usernameEmail: "testuser",
        password: "secret"
      });

    authToken = resLogin.headers["set-cookie"][0];
  });

  describe("POST /users", async () => {
    test("create new user", async () => {
      const res = await request(app)
        .post("/api/users")
        .send({
          username: "newtestuser",
          firstName: "Test2",
          lastName: "User2",
          email: "test2@user.com",
          phone: "55555555",
          password: "secret"
        });

      expect(res.status).toEqual(200);
      expect(res.body).toBeDefined();
    });

    test("create user with taken username", async () => {
      const res = await request(app)
        .post("/api/users")
        .send({
          username: "newtestuser",
          firstName: "Test",
          lastName: "User",
          email: "anothertest@user.com",
          phone: "55555552",
          password: "secret"
        });

      expect(res.status).toEqual(409);
      expect(res.body.code).toEqual(ec.PUD017.code);
    });

    test("create user with invalid email", async () => {
      const res = await request(app)
        .post("/api/users")
        .send({
          username: "newtestuser",
          firstName: "Test",
          lastName: "User",
          email: "notemail.com",
          phone: "55555553",
          password: "secret"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD004.code);
    });
  });

  describe("GET /user", async () => {
    test("should get user", async () => {
      const res = await request(app)
        .get("/api/users/" + user.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.headers["content-type"]).toEqual(expect.stringContaining("json"));
      expect(res.body.username).toEqual("testuser");
    });
  });
});
