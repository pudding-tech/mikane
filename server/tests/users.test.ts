import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "./setup";
import * as ec from "../src/types/errorCodes";
import { User } from "../src/types/types";

describe("users", async () => {

  let authToken: string;
  let user: User;
  let user2: User;

  /*
   * Create user, then log in
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

    const resLogin = await request(app)
      .post("/api/login")
      .send({
        usernameEmail: "testuser",
        password: "secret"
      });

    authToken = resLogin.headers["set-cookie"][0];
  });

  /* ----------- */
  /* POST /users */
  /* ----------- */
  describe("POST /users", async () => {
    test("create new user", async () => {
      const res = await request(app)
        .post("/api/users")
        .send({
          username: "newtestuser",
          firstName: "Test2",
          lastName: "User2",
          email: "newtest@user.com",
          phone: "55555555",
          password: "secret"
        });

      expect(res.status).toEqual(200);
      expect(res.body).toBeDefined();
      user2 = res.body;
    });

    test("should fail create user with taken username", async () => {
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

    test("should fail create user with invalid email", async () => {
      const res = await request(app)
        .post("/api/users")
        .send({
          username: "anothertestuser",
          firstName: "Test",
          lastName: "User",
          email: "notemail.com",
          phone: "55555553",
          password: "secret"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD004.code);
    });

    test("should fail create user with empty first name", async () => {
      const res = await request(app)
        .post("/api/users")
        .send({
          username: "anothertestuser",
          firstName: " ",
          lastName: "User",
          email: "anothertest@user.com",
          phone: "55555554",
          password: "secret"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD059.code);
    });
  });

  /* ---------- */
  /* GET /users */
  /* ---------- */
  describe("GET /users", async () => {
    test("should get users", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.length).toEqual(2);
      expect(res.body[0].event).toBeUndefined();
    });

    test("should get users except self", async () => {
      const res = await request(app)
        .get("/api/users")
        .query("exclude=self")
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].username).toEqual(user2.username);
      expect(res.body[0].event).toBeUndefined();
    });
  });

  /* -------------- */
  /* GET /users/:id */
  /* -------------- */
  describe("GET /users/:id", async () => {
    test("should get user", async () => {
      const res = await request(app)
        .get("/api/users/" + user.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.headers["content-type"]).toEqual(expect.stringContaining("json"));
      expect(res.body.username).toEqual("testuser");
    });

    test("should not find user", async () => {
      const res = await request(app)
        .get("/api/users/" + 3)
        .set("Cookie", authToken);

      expect(res.status).toEqual(404);
      expect(res.body.code).toEqual(ec.PUD008.code);
    });
  });

  /* -------------- */
  /* PUT /users/:id */
  /* -------------- */
  describe("PUT /users/:id", async () => {
    test("should edit user", async () => {
      const res = await request(app)
        .put("/api/users/" + user.id)
        .set("Cookie", authToken)
        .send({
          firstName: "Changed"
        });

      expect(res.status).toEqual(200);
      expect(res.body.firstName).toEqual("Changed");
    });

    test("should fail edit user with non-number user ID", async () => {
      const res = await request(app)
        .put("/api/users/" + "a")
        .set("Cookie", authToken)
        .send({
          firstName: "Wrong"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD016.code);
    });

    test("should fail edit user with empty first name", async () => {
      const res = await request(app)
        .put("/api/users/" + user.id)
        .set("Cookie", authToken)
        .send({
          firstName: " "
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD059.code);
    });
  });

  /* ----------------- */
  /* DELETE /users/:id */
  /* ----------------- */
  describe("DELETE /users/:id", async () => {
    test("should delete user", async () => {
      const res = await request(app)
        .delete("/api/users/" + user2.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.success).toEqual(true);
    });

    test("confirm deleted user does not exist", async () => {
      const res = await request(app)
        .get("/api/users/" + user2.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(404);
      expect(res.body.code).toEqual(ec.PUD008.code);
    });
  });

  /* -------------------------- */
  /* POST /users/changepassword */
  /* -------------------------- */
  describe("POST /users/changepassword", async () => {
    test("should not change password when current password is wrong", async () => {
      const res = await request(app)
        .post("/api/users/changepassword")
        .set("Cookie", authToken)
        .send({
          currentPassword: "wrongpassword",
          newPassword: "123"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD081.code);
    });

    test("should change password", async () => {
      const res = await request(app)
        .post("/api/users/changepassword")
        .set("Cookie", authToken)
        .send({
          currentPassword: "secret",
          newPassword: "thenewpassword"
        });

      expect(res.status).toEqual(200);
      expect(res.body.message).toEqual("Password successfully changed");
    });

    test("confirm cannot login with old password", async () => {
      const res = await request(app)
        .post("/api/login")
        .send({
          usernameEmail: "testuser",
          password: "secret"
        });

      expect(res.status).toEqual(401);
      expect(res.body.code).toEqual(ec.PUD003.code);
    });

    test("confirm can login with new password", async () => {
      const res = await request(app)
        .post("/api/login")
        .send({
          usernameEmail: "testuser",
          password: "thenewpassword"
        });

      expect(res.status).toEqual(200);
      expect(res.body.username).toEqual(user.username);
      expect(res.headers["set-cookie"]).toBeDefined();
    });
  });
});
