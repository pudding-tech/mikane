import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "./setup";
import * as ec from "../src/types/errorCodes";
import { Category, Event, User } from "../src/types/types";
import { EventStatusType } from "../src/types/enums";

describe("categories", async () => {

  let authToken: string;
  let user: User;
  let event: Event;
  let category: Category;

  /*
   * Create user, log in, then create event
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

    const resEvent = await request(app)
      .post("/api/events")
      .set("Cookie", authToken)
      .send({
        name: "Example event",
        description: "Example description",
        private: false
      });

    event = resEvent.body;
  });

  /* ---------------- */
  /* POST /categories */
  /* ---------------- */
  describe("POST /categories", async () => {
    test("should create category", async () => {
      const res = await request(app)
        .post("/api/categories")
        .set("Cookie", authToken)
        .send({
          name: "Test category",
          icon: "shopping_cart",
          weighted: false,
          eventId: event.id
        });

      expect(res.status).toEqual(200);
      expect(res.body.name).toEqual("Test category");
      category = res.body;
    });

    test("fail create category with same name", async () => {
      const res = await request(app)
        .post("/api/categories")
        .set("Cookie", authToken)
        .send({
          name: "Test category",
          icon: "restaurant",
          weighted: false,
          eventId: event.id
        });

      expect(res.status).toEqual(409);
      expect(res.body.code).toEqual(ec.PUD097.code);
    });

    test("fail create category without event ID", async () => {
      const res = await request(app)
        .post("/api/categories")
        .set("Cookie", authToken)
        .send({
          name: "Test category 2",
          icon: "shopping_cart",
          weighted: false
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD046.code);
    });

    test("fail create category with invalid UUID event ID", async () => {
      const res = await request(app)
        .post("/api/categories")
        .set("Cookie", authToken)
        .send({
          name: "Test category 2",
          icon: "shopping_cart",
          weighted: false,
          eventId: "56e901ad-374f"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD013.code);
    });

    test("fail create category with invalid event ID", async () => {
      const res = await request(app)
        .post("/api/categories")
        .set("Cookie", authToken)
        .send({
          name: "Test category 2",
          icon: "shopping_cart",
          weighted: false,
          eventId: "56e901ad-374f-4e1d-92f1-d02dd22d11d3"
        });

      expect(res.status).toEqual(404);
      expect(res.body.code).toEqual(ec.PUD006.code);
    });

    test("fail create category with invalid icon", async () => {
      const res = await request(app)
        .post("/api/categories")
        .set("Cookie", authToken)
        .send({
          name: "Test category 2",
          icon: "not_an_icon",
          weighted: false,
          eventId: event.id
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD096.code);
    });

    test("should set event as ready to settle", async () => {
      const res = await request(app)
        .put("/api/events/" + event.id)
        .set("Cookie", authToken)
        .send({
          status: EventStatusType.READY_TO_SETTLE
        });

      expect(res.status).toEqual(200);
      expect(res.body.status.id).toEqual(EventStatusType.READY_TO_SETTLE);
    });

    test("fail creating category in event with status 'ready to settle'", async () => {
      const res = await request(app)
        .post("/api/categories")
        .set("Cookie", authToken)
        .send({
          name: "Another category",
          icon: "shopping_cart",
          weighted: false,
          eventId: event.id
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD118.code);
    });

    test("should set event as active", async () => {
      const res = await request(app)
        .put("/api/events/" + event.id)
        .set("Cookie", authToken)
        .send({
          status: EventStatusType.ACTIVE
        });

      expect(res.status).toEqual(200);
      expect(res.body.status.id).toEqual(EventStatusType.ACTIVE);
    });
  });

  /* --------------- */
  /* GET /categories */
  /* --------------- */
  describe("GET /categories", async () => {
    test("should get categories", async () => {
      const res = await request(app)
        .get("/api/categories")
        .query("eventId=" + event.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.length).toEqual(1);
    });

    test("fail find categories with invalid event ID", async () => {
      const res = await request(app)
        .get("/api/categories")
        .query("eventId=56e901ad-374f-4e1d-92f1-d02dd22d11d3")
        .set("Cookie", authToken);

      expect(res.status).toEqual(404);
      expect(res.body.code).toEqual(ec.PUD006.code);
    });
  });

  /* ------------------- */
  /* GET /categories/:id */
  /* ------------------- */
  describe("GET /categories/:id", async () => {
    test("should get category", async () => {
      const res = await request(app)
        .get("/api/categories/" + category.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.name).toEqual(category.name);
    });

    test("fail find category", async () => {
      const res = await request(app)
        .get("/api/categories/56e901ad-374f-4e1d-92f1-d02dd22d11d3")
        .set("Cookie", authToken);

      expect(res.status).toEqual(404);
      expect(res.body.code).toEqual(ec.PUD007.code);
    });
  });

  /* ------------------- */
  /* PUT /categories/:id */
  /* ------------------- */
  describe("PUT /categories/:id", async () => {
    test("fail edit category - invalid UUID", async () => {
      const res = await request(app)
        .put("/api/categories/56e901ad-374f")
        .set("Cookie", authToken)
        .send({
          name: "New test category name"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD045.code);
    });

    test("fail edit category - invalid ID", async () => {
      const res = await request(app)
        .put("/api/categories/56e901ad-374f-4e1d-92f1-d02dd22d11d3")
        .set("Cookie", authToken)
        .send({
          name: "New test category name"
        });

      expect(res.status).toEqual(404);
      expect(res.body.code).toEqual(ec.PUD007.code);
    });

    test("fail edit category - no properties provided", async () => {
      const res = await request(app)
        .put("/api/categories/56e901ad-374f-4e1d-92f1-d02dd22d11d3")
        .set("Cookie", authToken)
        .send({});

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD115.code);
    });

    test("fail edit category - name is empty string", async () => {
      const res = await request(app)
        .put("/api/categories/56e901ad-374f-4e1d-92f1-d02dd22d11d3")
        .set("Cookie", authToken)
        .send({
          name: " "
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD059.code);
    });

    test("fail edit category - icon not valid", async () => {
      const res = await request(app)
        .put("/api/categories/56e901ad-374f-4e1d-92f1-d02dd22d11d3")
        .set("Cookie", authToken)
        .send({
          icon: "goofy"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD096.code);
    });

    test("should edit category", async () => {
      const res = await request(app)
        .put("/api/categories/" + category.id)
        .set("Cookie", authToken)
        .send({
          name: "New test category name",
          icon: "movie"
        });

      expect(res.status).toEqual(200);
      expect(res.body.id).toEqual(category.id);
      expect(res.body.icon).toEqual("movie");
      category.name = res.body.name;
    });
  });

  /* ---------------------------- */
  /* PUT /categories/:id/weighted */
  /* ---------------------------- */
  describe("PUT /categories/:id/weighted", async () => {
    test("should edit category weighted status", async () => {
      const res = await request(app)
        .put(`/api/categories/${category.id}/weighted`)
        .set("Cookie", authToken)
        .send({
          weighted: true
        });

      expect(res.status).toEqual(200);
      expect(res.body.id).toEqual(category.id);
      expect(res.body.weighted).toEqual(true);
      category.weighted = res.body.weighted;
    });

    test("fail edit category weighted status without weighted", async () => {
      const res = await request(app)
        .put(`/api/categories/${category.id}/weighted`)
        .set("Cookie", authToken)
        .send({});

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD051.code);
    });
  });

  /* --------------------------------- */
  /* POST /categories/:id/user/:userId */
  /* --------------------------------- */
  describe("PUT /categories/:id/user/:userId", async () => {
    // Check number of users in category (should be 0)
    test("number of users in category should be 0", async () => {
      const res = await request(app)
        .get("/api/categories/" + category.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.users.length).toEqual(0);
    });

    // Try adding user to weighted category without weight (should not be allowed)
    test("fail add user to weighted category without weight", async () => {
      const res = await request(app)
        .post(`/api/categories/${category.id}/user/${user.id}`)
        .set("Cookie", authToken);

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD012.code);
    });

    // Add user to category and check number of users (should be 1)
    test("should add user to weighted category", async () => {
      const res = await request(app)
        .post(`/api/categories/${category.id}/user/${user.id}`)
        .set("Cookie", authToken)
        .send({
          weight: 2
        });

      expect(res.status).toEqual(200);
      expect(res.body.users.length).toEqual(1);
      expect(res.body.users).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: user.name })
        ])
      );
    });
  });

  /* -------------------------------- */
  /* PUT /categories/:id/user/:userId */
  /* -------------------------------- */
  describe("PUT /categories/:id/user/:userId", async () => {
    test("fail edit user's weight in category with less than 1", async () => {
      const res = await request(app)
        .put(`/api/categories/${category.id}/user/${user.id}`)
        .set("Cookie", authToken)
        .send({
          weight: -1
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD049.code);
    });

    test("should edit user's weight in category", async () => {
      const res = await request(app)
        .put(`/api/categories/${category.id}/user/${user.id}`)
        .set("Cookie", authToken)
        .send({
          weight: 5
        });

      expect(res.status).toEqual(200);
      expect(res.body.users).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: user.name, weight: 5 })
        ])
      );
    });
  });

  /* ----------------------------------- */
  /* DELETE /categories/:id/user/:userId */
  /* ----------------------------------- */
  describe("DELETE /categories/:id/user/:userId", async () => {
    test("should remove user from category", async () => {
      const res = await request(app)
        .delete(`/api/categories/${category.id}/user/${user.id}`)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.users.length).toEqual(0);
    });
  });

  /* ---------------------- */
  /* DELETE /categories/:id */
  /* ---------------------- */
  describe("DELETE /categories/:id", async () => {
    test("fail delete category with invalid UUID", async () => {
      const res = await request(app)
        .delete("/api/categories/a7dfg-dfg3")
        .set("Cookie", authToken);

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD045.code);
    });

    test("should delete category", async () => {
      const res = await request(app)
        .delete("/api/categories/" + category.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.success).toEqual(true);
    });

    test("confirm deleted category does not exist", async () => {
      const res = await request(app)
        .get("/api/categories/" + category.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(404);
      expect(res.body.code).toEqual(ec.PUD007.code);
    });
  });
});
