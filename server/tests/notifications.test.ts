import { describe, test, expect, beforeAll, afterEach, vi } from "vitest";
import request from "supertest";
import nodemailerMock from "nodemailer-mock";
import app from "../src/server.ts";
import * as ec from "../src/types/errorCodes.ts";
import { Category, Event, Payment, User } from "../src/types/types.ts";
import { EventStatusType } from "../src/types/enums.ts";

// Mock nodemailer
vi.mock("nodemailer", () => nodemailerMock);

describe("notifications", async () => {

  let authToken: string;
  let user1: User;
  let user2: User;
  let user3: User;
  let event: Event;
  let category: Category;

  /*
   * Create 3 users, log in, create event, category, and expenses
   */
  beforeAll(async () => {
    const resUser1 = await request(app)
      .post("/api/users")
      .send({
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        email: "test1@mikane.com",
        phone: "11111111",
        password: "secret"
      });
    const resUser2 = await request(app)
      .post("/api/users")
      .send({
        username: "testuser2",
        firstName: "Test2",
        lastName: "User",
        email: "test2@mikane.com",
        phone: "22222222",
        password: "secret"
      });
    const resUser3 = await request(app)
      .post("/api/users")
      .send({
        username: "testuser3",
        firstName: "Test3",
        lastName: "User",
        email: "test3@mikane.com",
        phone: "33333333",
        password: "secret"
      });

    user1 = resUser1.body;
    user2 = resUser2.body;
    user3 = resUser3.body;

    const resLogin = await request(app)
      .post("/api/login")
      .send({
        usernameEmail: "testuser",
        password: "secret"
      });

    authToken = resLogin.headers["set-cookie"][0];

    // Create event
    const resEvent = await request(app)
      .post("/api/events")
      .set("Cookie", authToken)
      .send({
        name: "Example event",
        description: "Example description",
        private: false
      });

    event = resEvent.body;

    // Add users to event
    await request(app)
      .post(`/api/events/${event.id}/user/${user2.id}`)
      .set("Cookie", authToken);
    await request(app)
      .post(`/api/events/${event.id}/user/${user3.id}`)
      .set("Cookie", authToken);

    // Create category
    const resCategory = await request(app)
      .post("/api/categories")
      .set("Cookie", authToken)
      .send({
        name: "Example category",
        icon: "shopping_cart",
        weighted: false,
        eventId: event.id
      });

    category = resCategory.body;

    // Add users to category
    await request(app)
      .post(`/api/categories/${category.id}/user/${user1.id}`)
      .set("Cookie", authToken);
    await request(app)
      .post(`/api/categories/${category.id}/user/${user2.id}`)
      .set("Cookie", authToken);
    await request(app)
      .post(`/api/categories/${category.id}/user/${user3.id}`)
      .set("Cookie", authToken);

    // Create expenses
    await request(app)
      .post("/api/expenses")
      .set("Cookie", authToken)
      .send({
        name: "Test expense 1",
        amount: 2100,
        categoryId: category.id,
        payerId: user2.id
      });
    await request(app)
      .post("/api/expenses")
      .set("Cookie", authToken)
      .send({
        name: "Test expense 2",
        amount: 1800,
        categoryId: category.id,
        payerId: user3.id
      });
  });

  afterEach(async () => {
    nodemailerMock.mock.reset();
  });

  /* ----------------------------------- */
  /* POST /notifications/:eventId/settle */
  /* ----------------------------------- */
  describe("POST /notifications/:eventId/settle", async () => {
    test("fail sending ready-to-settle email for active event", async () => {
      const res = await request(app)
        .post(`/api/notifications/${event.id}/settle`)
        .set("Cookie", authToken);

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD140.code);
    });

    test("fail sending ready-to-settle email for settled event", async () => {
      // Set event as settled
      const resSettle = await request(app)
        .put("/api/events/" + event.id)
        .set("Cookie", authToken)
        .send({
          status: EventStatusType.SETTLED
        });

      expect(resSettle.status).toEqual(200);
      expect(resSettle.body.status.id).toEqual(EventStatusType.SETTLED);

      const res = await request(app)
        .post(`/api/notifications/${event.id}/settle`)
        .set("Cookie", authToken);

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD140.code);
    });

    test("should send ready-to-settle email with the correct payment information", async () => {
      // Set event as ready-to-settle
      const resSettle = await request(app)
        .put("/api/events/" + event.id)
        .set("Cookie", authToken)
        .send({
          status: EventStatusType.READY_TO_SETTLE
        });

      expect(resSettle.status).toEqual(200);
      expect(resSettle.body.status.id).toEqual(EventStatusType.READY_TO_SETTLE);

      // Get event payments (for cross-referencing)
      const resPayments = await request(app)
        .get(`/api/events/${event.id}/payments`)
        .set("Cookie", authToken);

      expect(resPayments.status).toEqual(200);
      const payments: Payment[] = resPayments.body;

      // Send emails
      const res = await request(app)
        .post(`/api/notifications/${event.id}/settle`)
        .set("Cookie", authToken);

      const sentEmails = nodemailerMock.mock.getSentMail();
      const subject = sentEmails[0].subject as string;
      const html = sentEmails[0].html as string;
      const sentToEmail = sentEmails[0].to as string;

      const receiver1NameStart = html.indexOf("<div style=\"margin-left: 10px;\">") + "<div style=\"margin-left: 10px;\">".length;
      const receiver1NameEnd = html.indexOf("<", receiver1NameStart);
      const receiver1Name = html.substring(receiver1NameStart, receiver1NameEnd).replace("- ", "").trim();
      const receiver1AmountStart = html.indexOf("border-radius: 4px;\">", receiver1NameEnd) + "border-radius: 4px;\">".length;
      const receiver1AmountEnd = html.indexOf("kr", receiver1AmountStart);
      const receiver1Amount = Number(html.substring(receiver1AmountStart, receiver1AmountEnd).trim());

      const receiver2NameStart = html.indexOf("<div style=\"margin-left: 10px;\">", receiver1AmountEnd) + "<div style=\"margin-left: 10px;\">".length;
      const receiver2NameEnd = html.indexOf("<", receiver2NameStart);
      const receiver2Name = html.substring(receiver2NameStart, receiver2NameEnd).replace("- ", "").trim();
      const receiver2AmountStart = html.indexOf("border-radius: 4px;\">", receiver2NameEnd) + "border-radius: 4px;\">".length;
      const receiver2AmountEnd = html.indexOf("kr", receiver2AmountStart);
      const receiver2Amount = Number(html.substring(receiver2AmountStart, receiver2AmountEnd).trim());

      expect(res.status).toEqual(200);
      expect(res.body.message).toEqual("Emails successfully sent");
      
      expect(subject).toEqual(event.name + " is now ready for settlement - Mikane");
      expect(sentToEmail).toEqual(user1.email);
      expect(receiver1Name).toEqual(payments[0].receiver.name);
      expect(receiver1Amount).toEqual(payments[0].amount);
      expect(receiver2Name).toEqual(payments[1].receiver.name);
      expect(receiver2Amount).toEqual(payments[1].amount);
    });
  });
});
