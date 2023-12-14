import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/server";
import * as ec from "../src/types/errorCodes";
import { Guest, User } from "../src/types/types";

describe("guest", async () => {

  let authToken: string;
  let user: User;
  let guest: Guest;

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

  /* ------------ */
  /* POST /guests */
  /* ------------ */
  describe("POST /guests", async () => {
    test("create new guest user", async () => {
      const res = await request(app)
        .post("/api/guests")
        .set("Cookie", authToken)
        .send({
          id: "d72c3688-ff43-4c70-920a-31bf22f66786",
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
        .set("Cookie", authToken)
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
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].guest).toEqual(true);
    });
  });

  /* --------------- */
  /* PUT /guests/:id */
  /* --------------- */
  describe("PUT /users/:id", async () => {
    test("should edit guest", async () => {
      const res = await request(app)
        .put("/api/guests/" + guest.id)
        .set("Cookie", authToken)
        .send({
          firstName: "Changed"
        });

      expect(res.status).toEqual(200);
      expect(res.body.firstName).toEqual("Changed");
    });

    test("fail edit guest with non-number ID", async () => {
      const res = await request(app)
        .put("/api/guests/" + "a")
        .set("Cookie", authToken)
        .send({
          firstName: "Wrong"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD016.code);
    });

    test("fail edit guest with unknown guest ID", async () => {
      const res = await request(app)
        .put("/api/guests/" + user.id)
        .set("Cookie", authToken)
        .send({
          firstName: "Wrong"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD122.code);
    });

    test("fail edit guest with no body properties", async () => {
      const res = await request(app)
        .put("/api/guests/" + user.id)
        .set("Cookie", authToken)
        .send({});

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD058.code);
    });

    test("fail edit guest with empty first name", async () => {
      const res = await request(app)
        .put("/api/guests/" + user.id)
        .set("Cookie", authToken)
        .send({
          firstName: " "
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD059.code);
    });
  });

  /* ------------------ */
  /* DELETE /guests/:id */
  /* ------------------ */
  describe("DELETE /guests/:id", async () => {
    test("fail delete guest with invalid UUID", async () => {
      const res = await request(app)
        .delete("/api/guests/555")
        .set("Cookie", authToken);

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD016.code);
    });

    test("fail delete guest with unknown guest ID", async () => {
      const res = await request(app)
        .delete("/api/guests/" + user.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD122.code);
    });

    test("should delete guest", async () => {
      const res = await request(app)
        .delete("/api/guests/" + guest.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.success).toEqual(true);
    });

    test("confirm deleted guest is deleted", async () => {
      const res = await request(app)
        .get("/api/guests")
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.length).toEqual(0);
    });
  });
});
