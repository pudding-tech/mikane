import { describe, test, expect, beforeAll, afterEach, vi } from "vitest";
import request from "supertest";
import nodemailerMock from "nodemailer-mock";
import app from "./setup";
import * as ec from "../src/types/errorCodes";
import { User } from "../src/types/types";

// Mock nodemailer
vi.mock("nodemailer", () => nodemailerMock);

describe("users", async () => {

  let authToken: string;
  let authToken2: string;
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

  afterEach(async () => {
    nodemailerMock.mock.reset();
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

    test("should be able to login with new user", async () => {
      const res = await request(app)
        .post("/api/login")
        .send({
          usernameEmail: "newtestuser",
          password: "secret"
        });

      expect(res.status).toEqual(200);
      expect(res.body.username).toEqual(user2.username);
      expect(res.headers["set-cookie"]).toBeDefined();
      authToken2 = res.headers["set-cookie"][0];
    });

    test("fail create user with taken username", async () => {
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

    test("fail create user with invalid email", async () => {
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

    test("fail create user with empty first name", async () => {
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
        .get("/api/users/56e901ad-374f-4e1d-92f1-d02dd22d11d3")
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

    test("fail edit user with non-number user ID", async () => {
      const res = await request(app)
        .put("/api/users/" + "a")
        .set("Cookie", authToken)
        .send({
          firstName: "Wrong"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD016.code);
    });

    test("fail edit user with empty first name", async () => {
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
        .set("Cookie", authToken2);

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
      authToken = res.headers["set-cookie"][0];
    });
  });

  /* ------------------ */
  /* POST /users/invite */
  /* ------------------ */
  describe("POST /users/invite", async () => {
    test("should send email to invited user", async () => {
      const res = await request(app)
        .post("/api/users/invite")
        .set("Cookie", authToken)
        .send({
          email: "b@mikane.no"
        });

      const sentEmail = nodemailerMock.mock.getSentMail();
      expect(res.status).toEqual(200);
      expect(sentEmail.length).toEqual(1);
      expect(sentEmail[0].to).toEqual("b@mikane.no");
      expect(sentEmail[0].subject).toEqual("You've been invited to Mikane");
    });
  });

  /* -------------------------- */
  /* GET /verifyregisteraccount */
  /* -------------------------- */
  describe("POST /verifyregisteraccount", async () => {
    test("fail when verifying register account key", async () => {
      const res = await request(app)
        .get("/api/verifyregisteraccount/2933edede2e915146d4b6082a8");

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD101.code);
    });
  });
});
