import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/server";
import { pool } from "../src/db";
import * as ec from "../src/types/errorCodes";
import { Guest, User } from "../src/types/types";

describe("guest", async () => {

  let authToken1: string;
  let authToken2: string;
  let authToken3: string;
  let user1: User;
  let user2: User;
  let guest: Guest;

  /*
   * Create user, then log in
   */
  beforeAll(async () => {
    const resUser1 = await request(app)
      .post("/api/users")
      .send({
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        email: "test@user.com",
        phone: "11111111",
        password: "secret"
      });
    user1 = resUser1.body;

    const resUser2 = await request(app)
      .post("/api/users")
      .send({
        username: "testuser2",
        firstName: "Test2",
        lastName: "User",
        email: "test2@user.com",
        phone: "22222222",
        password: "secret"
      });
    user2 = resUser2.body;

    await request(app)
      .post("/api/users")
      .send({
        username: "testuser3",
        firstName: "Test3",
        lastName: "User",
        email: "test3@user.com",
        phone: "33333333",
        password: "secret"
      });

    // Set super-admin for user2
    await pool.query(`
      UPDATE "user" SET super_admin = true WHERE id = '${user2.id}'
    `);

    const resLogin1 = await request(app)
      .post("/api/login")
      .send({
        usernameEmail: "testuser",
        password: "secret"
      });
    authToken1 = resLogin1.headers["set-cookie"][0];

    const resLogin2 = await request(app)
      .post("/api/login")
      .send({
        usernameEmail: "testuser2",
        password: "secret"
      });
    authToken2 = resLogin2.headers["set-cookie"][0];

    const resLogin3 = await request(app)
      .post("/api/login")
      .send({
        usernameEmail: "testuser3",
        password: "secret"
      });
    authToken3 = resLogin3.headers["set-cookie"][0];
  });

  /* ------------ */
  /* POST /guests */
  /* ------------ */
  describe("POST /guests", async () => {
    test("should create new guest user", async () => {
      const res = await request(app)
        .post("/api/guests")
        .set("Cookie", authToken1)
        .send({
          firstName: "Guest",
          lastName: "Last"
        });

      expect(res.status).toEqual(200);
      expect(res.body).toBeDefined();
      guest = res.body;
    });

    test("fail create guest with no first name", async () => {
      const res = await request(app)
        .post("/api/guests")
        .set("Cookie", authToken1)
        .send({
          lastName: "Last"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD121.code);
    });
  });

  /* ----------- */
  /* GET /guests */
  /* ----------- */
  describe("GET /guests", async () => {
    test("should get guests", async () => {
      const res = await request(app)
        .get("/api/guests")
        .set("Cookie", authToken1);

      expect(res.status).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].guest).toEqual(true);
    });
  });

  /* --------------- */
  /* PUT /guests/:id */
  /* --------------- */
  describe("PUT /users/:id", async () => {
    test("should edit guest as creator", async () => {
      const res = await request(app)
        .put("/api/guests/" + guest.id)
        .set("Cookie", authToken1)
        .send({
          firstName: "Changed"
        });

      expect(res.status).toEqual(200);
      expect(res.body.firstName).toEqual("Changed");
    });

    test("fail edit guest with non-number ID", async () => {
      const res = await request(app)
        .put("/api/guests/" + "a")
        .set("Cookie", authToken1)
        .send({
          firstName: "Wrong"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD016.code);
    });

    test("fail edit guest with unknown guest ID", async () => {
      const res = await request(app)
        .put("/api/guests/" + user1.id)
        .set("Cookie", authToken1)
        .send({
          firstName: "Wrong"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD122.code);
    });

    test("fail edit guest with no body properties", async () => {
      const res = await request(app)
        .put("/api/guests/" + guest.id)
        .set("Cookie", authToken1)
        .send({});

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD058.code);
    });

    test("fail edit guest with empty first name", async () => {
      const res = await request(app)
        .put("/api/guests/" + guest.id)
        .set("Cookie", authToken1)
        .send({
          firstName: " "
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD059.code);
    });

    test("fail edit guest when not authenticated as super-admin or guest's creator", async () => {
      const res = await request(app)
        .put("/api/guests/" + guest.id)
        .set("Cookie", authToken3)
        .send({
          firstName: "Changed"
        });

      expect(res.status).toEqual(403);
      expect(res.body.code).toEqual(ec.PUD130.code);
    });

    test("should edit guest as super-admin", async () => {
      const res = await request(app)
        .put("/api/guests/" + guest.id)
        .set("Cookie", authToken2)
        .send({
          firstName: "Changed again"
        });

      expect(res.status).toEqual(200);
      expect(res.body.firstName).toEqual("Changed again");
    });
  });

  /* ------------------ */
  /* DELETE /guests/:id */
  /* ------------------ */
  describe("DELETE /guests/:id", async () => {
    test("fail delete guest with invalid UUID", async () => {
      const res = await request(app)
        .delete("/api/guests/555")
        .set("Cookie", authToken1);

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD016.code);
    });

    test("fail delete guest with unknown guest ID", async () => {
      const res = await request(app)
        .delete("/api/guests/" + user1.id)
        .set("Cookie", authToken1);

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD122.code);
    });

    test("fail delete guest when not authenticated as super-admin or guest's creator", async () => {
      const res = await request(app)
        .delete("/api/guests/" + guest.id)
        .set("Cookie", authToken3);

      expect(res.status).toEqual(403);
      expect(res.body.code).toEqual(ec.PUD129.code);
    });

    test("should delete guest as creator", async () => {
      const res = await request(app)
        .delete("/api/guests/" + guest.id)
        .set("Cookie", authToken1);

      expect(res.status).toEqual(200);
      expect(res.body.success).toEqual(true);
    });

    test("confirm deleted guest is deleted", async () => {
      const res = await request(app)
        .get("/api/guests")
        .set("Cookie", authToken1);

      expect(res.status).toEqual(200);
      expect(res.body.length).toEqual(0);
    });

    test("should create guest user again", async () => {
      const res = await request(app)
        .post("/api/guests")
        .set("Cookie", authToken1)
        .send({
          firstName: "Guest",
          lastName: "Last"
        });

      expect(res.status).toEqual(200);
      expect(res.body).toBeDefined();
      guest = res.body;
    });

    test("should delete guest as super-admin", async () => {
      const res = await request(app)
        .delete("/api/guests/" + guest.id)
        .set("Cookie", authToken2);

      expect(res.status).toEqual(200);
      expect(res.body.success).toEqual(true);
    });

    test("confirm deleted guest is deleted", async () => {
      const res = await request(app)
        .get("/api/guests")
        .set("Cookie", authToken2);

      expect(res.status).toEqual(200);
      expect(res.body.length).toEqual(0);
    });
  });
});
