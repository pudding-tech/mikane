import { describe, test, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/server.ts";
import { PUD001 } from "../src/types/errorCodes.ts";
import { Category, Currency, Event, User, UserBalance, Payment } from "../src/types/types.ts";
import { mockCurrencyExchangeFetch, STATIC_EXCHANGE_RATES } from "./mocks/currencyExchangeMock.ts";

describe("currency exchange", async () => {

  let fetchMock: ReturnType<typeof mockCurrencyExchangeFetch>;
  let authToken: string;
  let user1: User;
  let user2: User;
  let event: Event;
  let category: Category;

  /*
   * Create 2 users, log in, create an event, create a category, and create expenses in different currencies
   */
  beforeAll(async () => {
    // Mock the fetch function to return a fixed exchange rate for testing
    fetchMock = mockCurrencyExchangeFetch();

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

    user1 = resUser1.body;
    user2 = resUser2.body;

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
        name: "Currency exchange event",
        description: "Event with expenses in multiple currencies",
        private: false,
        currency: "NOK"
      });

    event = resEvent.body;

    await request(app)
      .post(`/api/events/${event.id}/user/${user2.id}`)
      .set("Cookie", authToken);

    const resCategory = await request(app)
      .post("/api/categories")
      .set("Cookie", authToken)
      .send({
        name: "Currency exchange category",
        icon: "shopping_cart",
        weighted: false,
        eventId: event.id
      });

    category = resCategory.body;

    await request(app)
      .post(`/api/categories/${category.id}/user/${user1.id}`)
      .set("Cookie", authToken);

    await request(app)
      .post(`/api/categories/${category.id}/user/${user2.id}`)
      .set("Cookie", authToken);

    await request(app)
      .post("/api/expenses")
      .set("Cookie", authToken)
      .send({
        name: "EUR expense",
        amount: 100,
        currency: "EUR",
        categoryId: category.id,
        payerId: user1.id,
        expenseDate: new Date("2024-06-05")
      });

    await request(app)
      .post("/api/expenses")
      .set("Cookie", authToken)
      .send({
        name: "NOK expense",
        amount: 50,
        currency: "NOK",
        categoryId: category.id,
        payerId: user2.id,
        expenseDate: new Date("2024-06-05")
      });

    await request(app)
      .post("/api/expenses")
      .set("Cookie", authToken)
      .send({
        name: "USD expense",
        amount: 100,
        currency: "USD",
        categoryId: category.id,
        payerId: user2.id,
        expenseDate: new Date("2024-06-05")
      });
  });

  afterAll(() => {
    // Restore the original fetch function after tests
    fetchMock.mockRestore();
  });

  /* --------------- */
  /* GET /currencies */
  /* --------------- */
  describe("GET /currencies", async () => {
    test("fail getting currencies when not authenticated", async () => {
      const res = await request(app)
        .get("/api/currencies");

      expect(res.status).toEqual(401);
      expect(res.body.code).toEqual(PUD001.code);
    });

    test("should get supported currencies with format locale", async () => {
      const res = await request(app)
        .get("/api/currencies")
        .set("Cookie", authToken);

      const currencies: Currency[] = res.body;
      const nok = currencies.find((currency) => currency.code === "NOK");
      const usd = currencies.find((currency) => currency.code === "USD");
      const jpy = currencies.find((currency) => currency.code === "JPY");

      expect(res.status).toEqual(200);
      expect(currencies.length).toBeGreaterThan(0);

      expect(nok).toEqual({
        code: "NOK",
        name: "Norwegian Krone",
        formatLocale: "nb-NO"
      });
      expect(usd).toEqual({
        code: "USD",
        name: "US Dollar",
        formatLocale: "en-US"
      });
      expect(jpy).toEqual({
        code: "JPY",
        name: "Japanese Yen",
        formatLocale: "ja-JP"
      });
    });
  });

  /* ------------------------ */
  /* GET /events/:id/balances */
  /* ------------------------ */
  describe("GET /events/:id/balances", async () => {
    test("should calculate balances with expenses in EUR and USD converted to event currency (NOK)", async () => {
      const res = await request(app)
        .get(`/api/events/${event.id}/balances`)
        .set("Cookie", authToken);

      const balances: UserBalance[] = res.body;
      const user1Balance = balances.find((balance) => balance.user.id === user1.id);
      const user2Balance = balances.find((balance) => balance.user.id === user2.id);
      const convertedEurExpense = 100 * STATIC_EXCHANGE_RATES["EUR|NOK"];
      const convertedUsdExpense = 100 * STATIC_EXCHANGE_RATES["USD|NOK"];
      const totalExpenses = convertedEurExpense + convertedUsdExpense + 50;

      expect(res.status).toEqual(200);
      expect(balances.length).toEqual(2);

      expect(user1Balance?.expensesCount).toEqual(1);
      expect(user1Balance?.spending).toEqual(-(totalExpenses / 2));
      expect(user1Balance?.expenses).toEqual(convertedEurExpense);
      expect(user1Balance?.balance).toEqual(convertedEurExpense - (totalExpenses / 2));

      expect(user2Balance?.expensesCount).toEqual(2);
      expect(user2Balance?.spending).toEqual(-(totalExpenses / 2));
      expect(user2Balance?.expenses).toEqual(convertedUsdExpense + 50);
      expect(user2Balance?.balance).toEqual(convertedUsdExpense + 50 - (totalExpenses / 2));
    });
  });

  /* ------------------------ */
  /* GET /events/:id/payments */
  /* ------------------------ */
  describe("GET /events/:id/payments", async () => {
    test("should calculate payments with expenses in EUR and USD converted to event currency (NOK)", async () => {
      const res = await request(app)
        .get(`/api/events/${event.id}/payments`)
        .set("Cookie", authToken);

      const payments: Payment[] = res.body;

      expect(res.status).toEqual(200);
      expect(payments.length).toEqual(1);
      expect(payments[0].sender.id).toEqual(user2.id);
      expect(payments[0].receiver.id).toEqual(user1.id);
      expect(payments[0].amount).toEqual(225);
    });
  });
});
