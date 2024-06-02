import { describe, test, expect, beforeAll, afterEach, vi } from "vitest";
import request from "supertest";
import nodemailerMock from "nodemailer-mock";
import app from "../src/server";
import * as ec from "../src/types/errorCodes";
import { Category, Event, User } from "../src/types/types";
import { EventStatusType } from "../src/types/enums";

// Mock nodemailer
vi.mock("nodemailer", () => nodemailerMock);

describe("users", async () => {

  let authToken: string;
  let authToken2: string;
  let user: User;
  let user2: User;
  let deleteAccountKey: string;
  let inviteKey: string;

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

    test("fail create user with invalid username (longer than 40 characters)", async () => {
      const res = await request(app)
        .post("/api/users")
        .send({
          username: "123456789-abcdefghi-123456789-abcdefghi-1",
          firstName: "Test",
          lastName: "User",
          email: "anothertest@user.com",
          phone: "55555552",
          password: "secret"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD132.code);
    });

    test("fail create user with invalid username (shorter than 3 characters)", async () => {
      const res = await request(app)
        .post("/api/users")
        .send({
          username: "ta",
          firstName: "Test",
          lastName: "User",
          email: "anothertest@user.com",
          phone: "55555552",
          password: "secret"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD132.code);
    });

    test("fail create user with invalid username (includes invalid character)", async () => {
      const res = await request(app)
        .post("/api/users")
        .send({
          username: "another.testuser",
          firstName: "Test",
          lastName: "User",
          email: "anothertest@user.com",
          phone: "55555552",
          password: "secret"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD132.code);
    });

    test("fail create user with invalid username (cannot start with hyphen)", async () => {
      const res = await request(app)
        .post("/api/users")
        .send({
          username: "-anothertestuser",
          firstName: "Test",
          lastName: "User",
          email: "anothertest@user.com",
          phone: "55555552",
          password: "secret"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD132.code);
    });

    test("fail create user with invalid username (cannot end with hyphen)", async () => {
      const res = await request(app)
        .post("/api/users")
        .send({
          username: "anothertestuser-",
          firstName: "Test",
          lastName: "User",
          email: "anothertest@user.com",
          phone: "55555552",
          password: "secret"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD132.code);
    });

    test("fail create user with invalid username (cannot start with underscore)", async () => {
      const res = await request(app)
        .post("/api/users")
        .send({
          username: "_anothertestuser",
          firstName: "Test",
          lastName: "User",
          email: "anothertest@user.com",
          phone: "55555552",
          password: "secret"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD132.code);
    });

    test("fail create user with invalid username (cannot end with underscore)", async () => {
      const res = await request(app)
        .post("/api/users")
        .send({
          username: "anothertestuser_",
          firstName: "Test",
          lastName: "User",
          email: "anothertest@user.com",
          phone: "55555552",
          password: "secret"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD132.code);
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

    test("fail create user with invalid phone number", async () => {
      const res = await request(app)
        .post("/api/users")
        .send({
          username: "yetanothertestuser",
          firstName: "Test",
          lastName: "User",
          email: "phone@test.com",
          phone: "5555",
          password: "secret"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD113.code);
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
        .query("excludeSelf=true")
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

  /* -------------------------- */
  /* PUT /users/:id/preferences */
  /* -------------------------- */
  describe("PUT /users/:id/preferences", async () => {
    test("should get user preferences - by default, email is private and phone is public", async () => {
      const res = await request(app)
        .get("/api/users/" + user.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.publicEmail).toEqual(false);
      expect(res.body.publicPhone).toEqual(true);
    });

    test("should edit user preferences - email to public", async () => {
      const res = await request(app)
        .put(`/api/users/${user.id}/preferences`)
        .set("Cookie", authToken)
        .send({
          publicEmail: true
        });

      expect(res.status).toEqual(200);
      expect(res.body.publicEmail).toEqual(true);
      expect(res.body.publicPhone).toEqual(true);
    });

    test("should edit user preferences - email to private and phone to private", async () => {
      const res = await request(app)
        .put(`/api/users/${user.id}/preferences`)
        .set("Cookie", authToken)
        .send({
          publicEmail: false,
          publicPhone: false
        });

      expect(res.status).toEqual(200);
      expect(res.body.publicEmail).toEqual(false);
      expect(res.body.publicPhone).toEqual(false);
    });

    test("should edit user preferences - phone to public", async () => {
      const res = await request(app)
        .put(`/api/users/${user.id}/preferences`)
        .set("Cookie", authToken)
        .send({
          publicPhone: true
        });

      expect(res.status).toEqual(200);
      expect(res.body.publicEmail).toEqual(false);
      expect(res.body.publicPhone).toEqual(true);
    });

    test("fail edit user preferences with wrong property", async () => {
      const res = await request(app)
        .put(`/api/users/${user.id}/preferences`)
        .set("Cookie", authToken)
        .send({
          privateEmail: true
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD133.code);
    });
  });

  /* -------------------------------- */
  /* POST /users/requestdeleteaccount */
  /* -------------------------------- */
  describe("POST /users/requestdeleteaccount", async () => {
    test("should send delete account confirmation email to signed in user", async () => {
      const res = await request(app)
        .post("/api/users/requestdeleteaccount")
        .set("Cookie", authToken2);

      const sentEmail = nodemailerMock.mock.getSentMail();
      const html = sentEmail[0].html as string;
      const keyStart = html.indexOf("/delete-account/") + "/delete-account/".length;
      const keyEnd = html.indexOf("\"", keyStart);
      deleteAccountKey = html.substring(keyStart, keyEnd);

      expect(res.status).toEqual(200);
      expect(sentEmail.length).toEqual(1);
      expect(sentEmail[0].to).toEqual(user2.email);
      expect(sentEmail[0].subject).toEqual("Delete your Mikane account");
    });
  });

  /* ---------------------------- */
  /* GET /verifykey/deleteaccount */
  /* ---------------------------- */
  describe("POST /verifykey/deleteaccount", async () => {
    test("should verify the delete account key", async () => {
      const res = await request(app)
        .get("/api/verifykey/deleteaccount/" + deleteAccountKey)
        .set("Cookie", authToken2);

      expect(res.status).toEqual(200);
    });

    test("fail when verifying delete account key with wrong key", async () => {
      const res = await request(app)
        .get("/api/verifykey/deleteaccount/2933edede2e915146d4b6082a8")
        .set("Cookie", authToken2);

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD106.code);
    });
  });

  /* ----------------- */
  /* DELETE /users/:id */
  /* ----------------- */
  describe("DELETE /users/:id", async () => {

    let event1: Event;
    let event2: Event;

    test("create 2 events, add users to both, create category/expense, then archive one event", async () => {
      event1 = (await request(app)
        .post("/api/events")
        .set("Cookie", authToken)
        .send({
          name: "Event1",
          private: false
        })).body;

      event2 = (await request(app)
        .post("/api/events")
        .set("Cookie", authToken)
        .send({
          name: "Event2",
          private: false
        })).body;

      await request(app)
        .post(`/api/events/${event1.id}/user/${user2.id}`)
        .set("Cookie", authToken);
      await request(app)
        .post(`/api/events/${event2.id}/user/${user2.id}`)
        .set("Cookie", authToken);

      const category1: Category = (await request(app)
        .post("/api/categories")
        .set("Cookie", authToken)
        .send({
          name: "Category1",
          icon: "shopping_cart",
          weighted: false,
          eventId: event1.id
        })).body;

      const category2: Category = (await request(app)
        .post("/api/categories")
        .set("Cookie", authToken)
        .send({
          name: "Category2",
          icon: "shopping_cart",
          weighted: false,
          eventId: event2.id
        })).body;

      await request(app)
        .post(`/api/categories/${category1.id}/user/${user.id}`)
        .set("Cookie", authToken);
      await request(app)
        .post(`/api/categories/${category1.id}/user/${user2.id}`)
        .set("Cookie", authToken);
      await request(app)
        .post(`/api/categories/${category2.id}/user/${user.id}`)
        .set("Cookie", authToken);
      await request(app)
        .post(`/api/categories/${category2.id}/user/${user2.id}`)
        .set("Cookie", authToken);

      await request(app)
        .post("/api/expenses")
        .set("Cookie", authToken)
        .send({
          name: "Expense1",
          amount: "100",
          categoryId: category1.id,
          payerId: user2.id
        });

      await request(app)
        .post("/api/expenses")
        .set("Cookie", authToken)
        .send({
          name: "Expense2",
          amount: "200",
          categoryId: category2.id,
          payerId: user2.id
        });

      await request(app)
        .put("/api/events/" + event1.id)
        .set("Cookie", authToken)
        .send({
          status: EventStatusType.ARCHIVED
        });

      const finalEvent1: Event = (await request(app)
        .get("/api/events/" + event1.id)
        .set("Cookie", authToken2)).body;
      const finalEvent2: Event = (await request(app)
        .get("/api/events/" + event2.id)
        .set("Cookie", authToken2)).body;

      expect(finalEvent1.status.id).toEqual(EventStatusType.ARCHIVED);
      expect(finalEvent1.userInfo?.inEvent).toEqual(true);

      expect(finalEvent2.status.id).toEqual(EventStatusType.ACTIVE);
      expect(finalEvent2.userInfo?.inEvent).toEqual(true);
    });

    test("fail delete user without delete account key", async () => {
      const res = await request(app)
        .delete("/api/users/" + user2.id)
        .set("Cookie", authToken2);

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD106.code);
    });

    test("fail when deleting wrong user for the key", async () => {
      const res = await request(app)
        .delete("/api/users/" + user.id)
        .set("Cookie", authToken)
        .send({
          key: deleteAccountKey
        });

        expect(res.status).toEqual(400);
        expect(res.body.code).toEqual(ec.PUD108.code);
    });

    test("should delete user", async () => {
      const res = await request(app)
        .delete("/api/users/" + user2.id)
        .set("Cookie", authToken2)
        .send({
          key: deleteAccountKey
        });

      expect(res.status).toEqual(200);
      expect(res.body.success).toEqual(true);
    });

    test("confirm deleted user is deleted", async () => {
      const res = await request(app)
        .get("/api/users/" + user2.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(404);
      expect(res.body.code).toEqual(ec.PUD008.code);
    });

    test("confirm user2 is deleted from active event", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Cookie", authToken)
        .query("eventId=" + event2.id);

      expect(res.body.length).toEqual(1);
      expect(res.body).not.toContainEqual(expect.objectContaining({ id: user2.id }));
    });

    test("confirm user2 (as deleted user) is still in archived event", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Cookie", authToken)
        .query("eventId=" + event1.id);

      expect(res.body.length).toEqual(2);
      expect(res.body).toContainEqual(expect.objectContaining({ id: user2.id, name: "Deleted user" }));
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
    test("fail when requesting invite for invalid email address", async () => {
      const res = await request(app)
        .post("/api/users/invite")
        .set("Cookie", authToken)
        .send({
          email: "mikane.no"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD004.code);
    });

    test("should send email to invited user", async () => {
      const res = await request(app)
        .post("/api/users/invite")
        .set("Cookie", authToken)
        .send({
          email: "b@mikane.no"
        });

      const sentEmail = nodemailerMock.mock.getSentMail();
      const html = sentEmail[0].html as string;
      const keyStart = html.indexOf("/register/") + "/register/".length;
      const keyEnd = html.indexOf("\"", keyStart);
      inviteKey = html.substring(keyStart, keyEnd);

      expect(res.status).toEqual(200);
      expect(sentEmail.length).toEqual(1);
      expect(sentEmail[0].to).toEqual("b@mikane.no");
      expect(sentEmail[0].subject).toEqual("You've been invited to Mikane");
    });
  });

  /* ----------------------- */
  /* GET /verifykey/register */
  /* ----------------------- */
  describe("GET /verifykey/register", async () => {
    test("should verify the register account key", async () => {
      const res = await request(app)
        .get("/api/verifykey/register/" + inviteKey);

      expect(res.status).toEqual(200);
      expect(res.body.email).toEqual("b@mikane.no");
    });

    test("fail when verifying register account key with wrong key", async () => {
      const res = await request(app)
        .get("/api/verifykey/register/2933edede2e915146d4b6082a8");

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD101.code);
    });
  });
});
