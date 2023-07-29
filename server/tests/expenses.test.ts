import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "./setup";
import * as ec from "../src/types/errorCodes";
import { Category, Event, Expense, User } from "../src/types/types";

describe("expenses", async () => {

  let authToken: string;
  let authToken2: string;
  let user: User;
  let user2: User;
  let event: Event;
  let category: Category;
  let expense: Expense;

  /*
   * Create 2 users, log in as both, create event, create category, then add user1 category
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

    const resUser2 = await request(app)
      .post("/api/users")
      .send({
        username: "testuser2",
        firstName: "Test2",
        lastName: "User2",
        email: "test2@user.com",
        phone: "22222222",
        password: "secret2"
      });

    user = resUser1.body;
    user2 = resUser2.body;

    const resLogin1 = await request(app)
      .post("/api/login")
      .send({
        usernameEmail: "testuser",
        password: "secret"
      });

    const resLogin2 = await request(app)
      .post("/api/login")
      .send({
        usernameEmail: "testuser2",
        password: "secret2"
      });

    authToken = resLogin1.headers["set-cookie"][0];
    authToken2 = resLogin2.headers["set-cookie"][0];

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

    await request(app)
      .post(`/api/categories/${category.id}/user/${user.id}`)
      .set("Cookie", authToken);
  });

  /* -------------- */
  /* POST /expenses */
  /* -------------- */
  describe("POST /expenses", async () => {
    test("fail creating expense - amount is not a number", async () => {
      const res = await request(app)
        .post("/api/expenses")
        .set("Cookie", authToken)
        .send({
          name: "Test expense 1",
          description: "This is test",
          amount: "a33",
          categoryId: category.id,
          payerId: user.id
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD088.code);
    });

    test("fail creating expense - amount is negative", async () => {
      const res = await request(app)
        .post("/api/expenses")
        .set("Cookie", authToken)
        .send({
          name: "Test expense 1",
          description: "This is test",
          amount: -1,
          categoryId: category.id,
          payerId: user.id
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD030.code);
    });

    test("fail creating expense - categoryId is invalid UUID", async () => {
      const res = await request(app)
        .post("/api/expenses")
        .set("Cookie", authToken)
        .send({
          name: "Test expense 1",
          description: "This is test",
          amount: 100,
          categoryId: "nb3hgi",
          payerId: user.id
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD045.code);
    });

    test("fail creating expense - name is empty string", async () => {
      const res = await request(app)
        .post("/api/expenses")
        .set("Cookie", authToken)
        .send({
          name: " ",
          description: "This is test",
          amount: 100,
          categoryId: category.id,
          payerId: user.id
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD059.code);
    });

    test("should create expense", async () => {
      const res = await request(app)
        .post("/api/expenses")
        .set("Cookie", authToken)
        .send({
          name: "Test expense 1",
          description: "This is test",
          amount: 100,
          categoryId: category.id,
          payerId: user.id
        });

      expect(res.status).toEqual(200);
      expect(res.body.name).toEqual("Test expense 1");
      expect(res.body.payer.id).toEqual(user.id);
      expense = res.body;
    });

    test("fail create expense as user is not in event", async () => {
      const res = await request(app)
        .post("/api/expenses")
        .set("Cookie", authToken)
        .send({
          name: "Test expense 2",
          amount: 10,
          categoryId: category.id,
          payerId: user2.id
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD062.code);
    });
  });

  /* ------------- */
  /* GET /expenses */
  /* ------------- */
  describe("GET /expenses", async () => {
    test("should get expenses", async () => {
      const res = await request(app)
        .get("/api/expenses")
        .query("eventId=" + event.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: expense.id })
        ])
      );
    });

    test("fail finding expenses for non-existing event", async () => {
      const res = await request(app)
        .get("/api/expenses")
        .query("eventId=56e901ad-374f-4e1d-92f1-d02dd22d11d3")
        .set("Cookie", authToken);

      expect(res.status).toEqual(404);
      expect(res.body.code).toEqual(ec.PUD006.code);
    });
  });

  /* ----------------- */
  /* GET /expenses/:id */
  /* ----------------- */
  describe("GET /expenses/:id", async () => {
    test("should get expense", async () => {
      const res = await request(app)
        .get("/api/expenses/" + expense.id)
        .set("Cookie", authToken);
      
      expect(res.status).toEqual(200);
      expect(res.body.id).toEqual(expense.id);
    });

    test("fail finding expense", async () => {
      const res = await request(app)
        .get("/api/expenses/56e901ad-374f-4e1d-92f1-d02dd22d11d3")
        .set("Cookie", authToken);

      expect(res.status).toEqual(404);
      expect(res.body.code).toEqual(ec.PUD084.code);
    });
  });

  /* ---------------------------------------- */
  /* GET /events/:id/balances (with expenses) */
  /* ---------------------------------------- */
  describe("GET /events/:id/balances", async () => {
    // Add user2 to event
    test("should add user2 to event", async () => {
      const res = await request(app)
        .post(`/api/events/${event.id}/user/${user2.id}`)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
    });

    // Add user2 to category
    test("should add user2 to category", async () => {
      const res = await request(app)
        .post(`/api/categories/${category.id}/user/${user2.id}`)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.users.length).toEqual(2);
    });

    test("should get correct balance information for previous expense", async () => {
      const res = await request(app)
        .get(`/api/events/${event.id}/balances`)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.length).toEqual(2);
      expect(res.body[0].expensesCount).toEqual(1);
      expect(res.body[0].spending).toEqual(-50);
      expect(res.body[0].expenses).toEqual(100);
      expect(res.body[0].balance).toEqual(50);

      expect(res.body[1].expensesCount).toEqual(0);
      expect(res.body[1].spending).toEqual(-50);
      expect(res.body[1].expenses).toEqual(0);
      expect(res.body[1].balance).toEqual(-50);
    });
  });

  /* ---------------------------------------- */
  /* GET /events/:id/payments (with expenses) */
  /* ---------------------------------------- */
  describe("GET /events/:id/payments", async () => {
    test("should get correct payments information for previous expense", async () => {
      const res = await request(app)
        .get(`/api/events/${event.id}/payments`)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body[0].sender.id).toEqual(user2.id);
      expect(res.body[0].receiver.id).toEqual(user.id);
      expect(res.body[0].amount).toEqual(50);
    });
  });

  /* ----------------- */
  /* PUT /expenses/:id */
  /* ----------------- */
  describe("PUT /expenses/:id", async () => {
    test("fail editing expense - no properties provided", async () => {
      const res = await request(app)
        .put("/api/expenses/" + expense.id)
        .set("Cookie", authToken)
        .send({});

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD116.code);
    });

    test("fail editing expense amount - not a number", async () => {
      const res = await request(app)
        .put("/api/expenses/" + expense.id)
        .set("Cookie", authToken)
        .send({
          amount: "expenseAmount"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD116.code);
    });

    test("fail editing expense amount - negative number", async () => {
      const res = await request(app)
        .put("/api/expenses/" + expense.id)
        .set("Cookie", authToken)
        .send({
          amount: -1
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD030.code);
    });

    test("fail editing expense categoryId - invalid UUID", async () => {
      const res = await request(app)
        .put("/api/expenses/" + expense.id)
        .set("Cookie", authToken)
        .send({
          categoryId: "nb3hgi"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD045.code);
    });

    test("fail editing expense name - empty string", async () => {
      const res = await request(app)
        .put("/api/expenses/" + expense.id)
        .set("Cookie", authToken)
        .send({
          name: " "
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD059.code);
    });

    test("fail editing expense payer - user is not in event", async () => {
      const userRes = await request(app)
      .post("/api/users")
      .send({
        username: "expenseuser",
        firstName: "Test",
        lastName: "User",
        email: "expense@user.com",
        phone: "11111133",
        password: "secret"
      });
      const user3 = userRes.body;
      expect(user3.id).toBeDefined();

      const res = await request(app)
        .put("/api/expenses/" + expense.id)
        .set("Cookie", authToken)
        .send({
          payerId: user3.id
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD062.code);
    });

    test("should edit expense amount", async () => {
      const res = await request(app)
        .put("/api/expenses/" + expense.id)
        .set("Cookie", authToken)
        .send({
          name: "Edited expense",
          description: "",
          amount: 200
        });

      expect(res.status).toEqual(200);
      expect(res.body.amount).toEqual(200);
      expect(res.body.description).toEqual(null);
    });
  });

  /* -------------------- */
  /* DELETE /expenses/:id */
  /* -------------------- */
  describe("DELETE /expenses/:id", async () => {
    test("fail deleting expense - user is not expense payer or event admin", async () => {
      const res = await request(app)
        .delete("/api/expenses/" + expense.id)
        .set("Cookie", authToken2);

      expect(res.status).toEqual(403);
      expect(res.body.code).toEqual(ec.PUD086.code);
    });

    test("should delete expense", async () => {
      const res = await request(app)
        .delete("/api/expenses/" + expense.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.success).toEqual(true);
    });
  });
});
