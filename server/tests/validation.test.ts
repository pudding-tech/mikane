import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/server";
import * as ec from "../src/types/errorCodes";
import { Category, Event, User } from "../src/types/types";

describe("validation", async () => {

  let authToken: string;
  let user: User;
  let event: Event;
  let category: Category;

  /*
   * Create 1 user, log in, and create event
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

    const resCategory = await request(app)
      .post("/api/categories")
      .set("Cookie", authToken)
      .send({
        name: "Test category",
        icon: "shopping_cart",
        weighted: false,
        eventId: event.id
      });

    category = resCategory.body;
  });

  /* ------------------------------ */
  /* POST /validation/user/username */
  /* ------------------------------ */
  describe("POST /validation/user/username", async () => {
    test("fail when validating username already in use", async () => {
      const res = await request(app)
        .post("/api/validation/user/username")
        .send({
          username: user.username
        });

      expect(res.status).toEqual(409);
      expect(res.body.code).toEqual(ec.PUD017.code);
    });

    test("fail when validating username without username in body", async () => {
      const res = await request(app)
        .post("/api/validation/user/username")
        .send({});

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD109.code);
    });

    test("fail when validating invalid username - only spaces", async () => {
      const res = await request(app)
        .post("/api/validation/user/username")
        .send({
          username: " "
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD059.code);
    });

    test("fail when validating invalid username - shorter than 3 characters", async () => {
      const res = await request(app)
        .post("/api/validation/user/username")
        .send({
          username: "ab"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD132.code);
    });

    test("fail when validating invalid username - longer than 40 characters", async () => {
      const res = await request(app)
        .post("/api/validation/user/username")
        .send({
          username: "abcdefghijklmnopqrstuvwxyzabcdefghijklmno"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD132.code);
    });

    test("fail when validating invalid username - invalid character !", async () => {
      const res = await request(app)
        .post("/api/validation/user/username")
        .send({
          username: "abc!d"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD132.code);
    });

    test("fail when validating invalid username - invalid character &", async () => {
      const res = await request(app)
        .post("/api/validation/user/username")
        .send({
          username: "abc&d"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD132.code);
    });

    test("fail when validating invalid username - starting with hyphen", async () => {
      const res = await request(app)
        .post("/api/validation/user/username")
        .send({
          username: "-abc"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD132.code);
    });

    test("fail when validating invalid username - ending with hyphen", async () => {
      const res = await request(app)
        .post("/api/validation/user/username")
        .send({
          username: "abc-"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD132.code);
    });

    test("fail when validating username with invalid user ID", async () => {
      const res = await request(app)
        .post("/api/validation/user/username")
        .set("Cookie", authToken)
        .send({
          username: "testuser2",
          userId: "a212e758"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD016.code);
    });

    test("should successfully validate username not already in use", async () => {
      const res = await request(app)
        .post("/api/validation/user/username")
        .send({
          username: "testuser2"
        });

      expect(res.status).toEqual(200);
      expect(res.body.valid).toEqual(true);
    });

    test("should successfully validate username already in use when given same user in body", async () => {
      const res = await request(app)
        .post("/api/validation/user/username")
        .send({
          username: user.username,
          userId: user.id
        });

      expect(res.status).toEqual(200);
      expect(res.body.valid).toEqual(true);
    });
  });

  /* --------------------------- */
  /* POST /validation/user/email */
  /* --------------------------- */
  describe("POST /validation/user/email", async () => {
    test("fail when validating email already in use", async () => {
      const res = await request(app)
        .post("/api/validation/user/email")
        .set("Cookie", authToken)
        .send({
          email: user.email
        });

      expect(res.status).toEqual(409);
      expect(res.body.code).toEqual(ec.PUD018.code);
    });

    test("fail when validating email without email in body", async () => {
      const res = await request(app)
        .post("/api/validation/user/email")
        .set("Cookie", authToken)
        .send({});

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD110.code);
    });

    test("fail when validating invalid email", async () => {
      const res = await request(app)
        .post("/api/validation/user/email")
        .set("Cookie", authToken)
        .send({
          email: "testuser.com"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD004.code);
    });

    test("fail when validating invalid email (too long domain)", async () => {
      const res = await request(app)
        .post("/api/validation/user/email")
        .set("Cookie", authToken)
        .send({
          email: "test@aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.com"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD004.code);
    });

    test("fail when validating email with invalid user ID", async () => {
      const res = await request(app)
        .post("/api/validation/user/email")
        .set("Cookie", authToken)
        .send({
          email: "anothertest@user.com",
          userId: "a212e758"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD016.code);
    });

    test("should successfully validate email not already in use", async () => {
      const res = await request(app)
        .post("/api/validation/user/email")
        .set("Cookie", authToken)
        .send({
          email: "anothertest@user.com"
        });

      expect(res.status).toEqual(200);
      expect(res.body.valid).toEqual(true);
    });

    test("should successfully validate email already in use when given same user in body", async () => {
      const res = await request(app)
        .post("/api/validation/user/email")
        .send({
          email: user.email,
          userId: user.id
        });

      expect(res.status).toEqual(200);
      expect(res.body.valid).toEqual(true);
    });
  });

  /* --------------------------- */
  /* POST /validation/user/phone */
  /* --------------------------- */
  describe("POST /validation/user/phone", async () => {
    test("fail when validating phone number already in use", async () => {
      const res = await request(app)
        .post("/api/validation/user/phone")
        .set("Cookie", authToken)
        .send({
          phone: user.phone
        });

      expect(res.status).toEqual(409);
      expect(res.body.code).toEqual(ec.PUD019.code);
    });

    test("fail when validating phone number without phone in body", async () => {
      const res = await request(app)
        .post("/api/validation/user/phone")
        .set("Cookie", authToken)
        .send({});

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD111.code);
    });

    test("fail when validating invalid phone number", async () => {
      const res = await request(app)
        .post("/api/validation/user/phone")
        .set("Cookie", authToken)
        .send({
          phone: "1234"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD113.code);
    });

    test("fail when validating phone number with invalid user ID", async () => {
      const res = await request(app)
        .post("/api/validation/user/phone")
        .set("Cookie", authToken)
        .send({
          phone: "11111112",
          userId: "a212e758"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD016.code);
    });

    test("should successfully validate phone number not already in use", async () => {
      const res = await request(app)
        .post("/api/validation/user/phone")
        .set("Cookie", authToken)
        .send({
          phone: "11111112"
        });

      expect(res.status).toEqual(200);
      expect(res.body.valid).toEqual(true);
    });

    test("should successfully validate phone number already in use when given same user in body", async () => {
      const res = await request(app)
        .post("/api/validation/user/phone")
        .send({
          phone: user.phone,
          userId: user.id
        });

      expect(res.status).toEqual(200);
      expect(res.body.valid).toEqual(true);
    });
  });

  /* --------------------------- */
  /* POST /validation/event/name */
  /* --------------------------- */
  describe("POST /validation/event/name", async () => {
    test("fail when validating event name already in use", async () => {
      const res = await request(app)
        .post("/api/validation/event/name")
        .set("Cookie", authToken)
        .send({
          name: event.name
        });

      expect(res.status).toEqual(409);
      expect(res.body.code).toEqual(ec.PUD005.code);
    });

    test("fail when validating event name without name in body", async () => {
      const res = await request(app)
        .post("/api/validation/event/name")
        .set("Cookie", authToken)
        .send({});

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD112.code);
    });

    test("fail when validating invalid event name", async () => {
      const res = await request(app)
        .post("/api/validation/event/name")
        .set("Cookie", authToken)
        .send({
          name: " "
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD059.code);
    });

    test("fail when validating event name with invalid event ID", async () => {
      const res = await request(app)
        .post("/api/validation/event/name")
        .set("Cookie", authToken)
        .send({
          name: "New event",
          eventId: "a212e758"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD013.code);
    });

    test("should successfully validate event name not already in use", async () => {
      const res = await request(app)
        .post("/api/validation/event/name")
        .set("Cookie", authToken)
        .send({
          name: "New event"
        });

      expect(res.status).toEqual(200);
      expect(res.body.valid).toEqual(true);
    });

    test("should successfully validate event name already in use when given same event in body", async () => {
      const res = await request(app)
        .post("/api/validation/event/name")
        .set("Cookie", authToken)
        .send({
          name: event.name,
          eventId: event.id
        });

      expect(res.status).toEqual(200);
      expect(res.body.valid).toEqual(true);
    });
  });

  /* ------------------------------ */
  /* POST /validation/category/name */
  /* ------------------------------ */
  describe("POST /validation/category/name", async () => {
    test("fail when validating category name already in use within event", async () => {
      const res = await request(app)
        .post("/api/validation/category/name")
        .set("Cookie", authToken)
        .send({
          name: category.name,
          eventId: event.id
        });

      expect(res.status).toEqual(409);
      expect(res.body.code).toEqual(ec.PUD097.code);
    });

    test("fail when validating category name without name in body", async () => {
      const res = await request(app)
        .post("/api/validation/category/name")
        .set("Cookie", authToken)
        .send({
          eventId: event.id
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD112.code);
    });

    test("fail when validating invalid category name", async () => {
      const res = await request(app)
        .post("/api/validation/category/name")
        .set("Cookie", authToken)
        .send({
          name: " ",
          eventId: event.id
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD059.code);
    });

    test("fail when validating category name with invalid UUID as event ID", async () => {
      const res = await request(app)
        .post("/api/validation/category/name")
        .set("Cookie", authToken)
        .send({
          name: "New category",
          eventId: "a212e758-bf71-42de-9371"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD013.code);
    });

    test("fail when validating category name with invalid event ID", async () => {
      const res = await request(app)
        .post("/api/validation/category/name")
        .set("Cookie", authToken)
        .send({
          name: "New category",
          eventId: "a212e758-bf71-42de-9371-da4dee3940fd"
        });

      expect(res.status).toEqual(404);
      expect(res.body.code).toEqual(ec.PUD006.code);
    });

    test("fail when validating category name with invalid category ID", async () => {
      const res = await request(app)
        .post("/api/validation/category/name")
        .set("Cookie", authToken)
        .send({
          name: "New category",
          eventId: event.id,
          categoryId: "a212e758"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD045.code);
    });

    test("should successfully validate category name not already in use within event", async () => {
      const res = await request(app)
        .post("/api/validation/category/name")
        .set("Cookie", authToken)
        .send({
          name: "New category",
          eventId: event.id
        });

      expect(res.status).toEqual(200);
      expect(res.body.valid).toEqual(true);
    });

    test("should successfully validate category name already in use when given same category in body", async () => {
      const res = await request(app)
        .post("/api/validation/category/name")
        .set("Cookie", authToken)
        .send({
          name: category.name,
          eventId: event.id,
          categoryId: category.id
        });

      expect(res.status).toEqual(200);
      expect(res.body.valid).toEqual(true);
    });
  });
});
