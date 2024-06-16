import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/server";
import * as ec from "../src/types/errorCodes";
import { Event, User } from "../src/types/types";
import { EventStatusType } from "../src/types/enums";

describe("events", async () => {

  let authToken: string;
  let authToken2: string;
  let user: User;
  let user2: User;
  let event: Event;
  let event2: Event;

  /*
   * Create 2 users, then log in both users
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
        username: "anotheruser",
        firstName: "Test",
        lastName: "User",
        email: "test2@user.com",
        phone: "111111112",
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
        usernameEmail: "anotheruser",
        password: "secret2"
      });

    authToken = resLogin1.headers["set-cookie"][0];
    authToken2 = resLogin2.headers["set-cookie"][0];
  });

  /* ------------ */
  /* POST /events */
  /* ------------ */
  describe("POST /events", async () => {
    test("create 2 events - one public and one private", async () => {
      const res1 = await request(app)
        .post("/api/events")
        .set("Cookie", authToken)
        .send({
          name: "Example event",
          description: "Example description",
          private: false
        });

      const res2 = await request(app)
        .post("/api/events")
        .set("Cookie", authToken)
        .send({
          name: "Another event",
          private: true
        });

      expect(res1.status).toEqual(200);
      expect(res1.body).toBeDefined();
      expect(res2.status).toEqual(200);
      expect(res2.body).toBeDefined();
      event = res1.body;
      event2 = res2.body;
    });

    test("fail create event with taken name", async () => {
      const res = await request(app)
        .post("/api/events")
        .set("Cookie", authToken)
        .send({
          name: "Example event",
          description: "Example description",
          private: false
        });

      expect(res.status).toEqual(409);
      expect(res.body.code).toEqual(ec.PUD005.code);
    });
  });

  /* ----------- */
  /* GET /events */
  /* ----------- */
  describe("GET /events", async () => {
    test("should get 2 events as user1", async () => {
      const res = await request(app)
        .get("/api/events")
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.length).toEqual(2);
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: "Another event" })
        ])
      );
    });

    test("should get 1 event as user2", async () => {
      const res = await request(app)
        .get("/api/events")
        .set("Cookie", authToken2);

      expect(res.status).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: "Example event" })
        ])
      );
    });

    test("fail get events with no authentication token cookie", async () => {
      const res = await request(app)
        .get("/api/events");

      expect(res.status).toEqual(401);
      expect(res.body.code).toEqual(ec.PUD001.code);
    });
  });

  /* ------------------ */
  /* GET /eventbyname */
  /* ------------------ */
  describe("GET /eventbyname", async () => {
    test("should get event by name", async () => {
      const res = await request(app)
        .get("/api/eventbyname")
        .set("Cookie", authToken)
        .send({
          name: "Example event"
        });

      expect(res.status).toEqual(200);
      expect(res.body.name).toEqual("Example event");
    });

    test("fail get event by non-exisisting name", async () => {
      const res = await request(app)
        .get("/api/eventbyname")
        .set("Cookie", authToken)
        .send({
          name: "No named event"
        });

      expect(res.status).toEqual(404);
      expect(res.body.code).toEqual(ec.PUD006.code);
    });

    test("should get event by name also when using API key as auth", async () => {
      const res = await request(app)
        .get("/api/eventbyname")
        .set("Authorization", "886a2ef41eedfa5bb9978268965a645e")
        .send({
          name: "Example event"
        });

      expect(res.status).toEqual(200);
      expect(res.body.name).toEqual("Example event");
    });

    test("fail get event by name when using wrong API key as auth", async () => {
      const res = await request(app)
        .get("/api/eventbyname")
        .set("Authorization", "886a2ef41eedfa5bb9978268965a6450")
        .send({
          name: "Example event"
        });

      expect(res.status).toEqual(401);
      expect(res.body.code).toEqual(ec.PUD066.code);
    });
  });

  /* --------------- */
  /* GET /events/:id */
  /* --------------- */
  describe("GET /events/:id", async () => {
    test("should get event", async () => {
      const res = await request(app)
        .get("/api/events/" + event.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.name).toEqual(event.name);
    });

    test("should not find event", async () => {
      const res = await request(app)
        .get("/api/events/56e901ad-374f-4e1d-92f1-d02dd22d11d3")
        .set("Cookie", authToken);

      expect(res.status).toEqual(404);
      expect(res.body.code).toEqual(ec.PUD006.code);
    });

    test("fail get private event when user is not in event", async () => {
      const res = await request(app)
        .get("/api/events/" + event2.id)
        .set("Cookie", authToken2);

      expect(res.status).toEqual(403);
      expect(res.body.code).toEqual(ec.PUD138.code);
    });
  });

  /* --------------- */
  /* PUT /events/:id */
  /* --------------- */
  describe("PUT /events/:id", async () => {
    test("should edit event", async () => {
      const res = await request(app)
        .put("/api/events/" + event.id)
        .set("Cookie", authToken)
        .send({
          name: "Changed"
        });

      expect(res.status).toEqual(200);
      expect(res.body.name).toEqual("Changed");
    });

    test("fail edit event when logged in user is not event admin", async () => {
      const res = await request(app)
        .put("/api/events/" + event.id)
        .set("Cookie", authToken2)
        .send({
          name: "Wrong"
        });

      expect(res.status).toEqual(403);
      expect(res.body.code).toEqual(ec.PUD087.code);
    });

    test("fail edit private event when logged in user is not in private event", async () => {
      const res = await request(app)
        .put("/api/events/" + event2.id)
        .set("Cookie", authToken2)
        .send({
          name: "Wrong"
        });

      expect(res.status).toEqual(403);
      expect(res.body.code).toEqual(ec.PUD138.code);
    });

    test("fail edit event with empty name", async () => {
      const res = await request(app)
        .put("/api/events/" + event.id)
        .set("Cookie", authToken)
        .send({
          name: " "
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD053.code);
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

    test("fail editing event with status 'ready to settle'", async () => {
      const res = await request(app)
        .put("/api/events/" + event.id)
        .set("Cookie", authToken)
        .send({
          name: "New name"
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD118.code);
    });

    test("should set event as archived", async () => {
      const res = await request(app)
        .put("/api/events/" + event.id)
        .set("Cookie", authToken)
        .send({
          status: EventStatusType.ARCHIVED
        });

      expect(res.status).toEqual(200);
      expect(res.body.status.id).toEqual(EventStatusType.ARCHIVED);
    });

    test("fail editing archived event", async () => {
      const res = await request(app)
        .put("/api/events/" + event.id)
        .set("Cookie", authToken)
        .send({
          name: "New name"
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

    test("fail setting event status as invalid type", async () => {
      const res = await request(app)
        .put("/api/events/" + event.id)
        .set("Cookie", authToken)
        .send({
          status: 9
        });

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD128.code);
    });
  });

  /* ----------------------- */
  /* GET /users/:id/events */
  /* ----------------------- */
  describe("GET /users/:id/events", async () => {
    test("should get list of user1's events", async () => {
      const res = await request(app)
        .get(`/api/users/${user.id}/events`)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.length).toEqual(2);
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: event.id
          }),
          expect.objectContaining({
            id: event2.id
          })
        ])
      );
    });

    test("should get list of user2's events", async () => {
      const res = await request(app)
        .get(`/api/users/${user2.id}/events`)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.length).toEqual(0);
    });
  });

  /* ----------------------------- */
  /* POST /events/:id/user/:userId */
  /* ----------------------------- */
  describe("POST /events/:id/user/:id", async () => {
    // Check number of users in event (should be 1)
    test("number of users in event should be 1", async () => {
      const res = await request(app)
        .get("/api/users")
        .query("eventId=" + event.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.length).toEqual(1);
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

    test("fail adding user2 to 'ready to settle' event", async () => {
      const res = await request(app)
        .post(`/api/events/${event.id}/user/${user2.id}`)
        .set("Cookie", authToken);

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

    // Add user2 to event
    test("should add user2 to event", async () => {
      const res = await request(app)
        .post(`/api/events/${event.id}/user/${user2.id}`)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
    });

    // Check number of users in event (should be 2)
    test("number of users in event should be 2", async () => {
      const res = await request(app)
        .get("/api/users")
        .query("eventId=" + event.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.length).toEqual(2);
    });
  });

  /* ------------------------------ */
  /* POST /events/:id/admin/:userId */
  /* ------------------------------ */
  describe("POST /events/:id/admin/:id", async () => {
    // Check that only user1 is event admin
    test("only user1 should be event admin", async () => {
      const res = await request(app)
        .get("/api/events/" + event.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.adminIds.length).toEqual(1);
      expect(res.body.adminIds[0]).toEqual(user.id);
    });

    test("should set event as archived", async () => {
      const res = await request(app)
        .put("/api/events/" + event.id)
        .set("Cookie", authToken)
        .send({
          status: EventStatusType.ARCHIVED
        });

      expect(res.status).toEqual(200);
      expect(res.body.status.id).toEqual(EventStatusType.ARCHIVED);
    });

    // Add user2 as admin of event
    test("should add user2 as event admin, even if archived", async () => {
      const res = await request(app)
        .post(`/api/events/${event.id}/admin/${user2.id}`)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
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

    // Check that user2 is also event admin
    test("user1 and user2 should both be event admins", async () => {
      const res = await request(app)
        .get("/api/events/" + event.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.adminIds.length).toEqual(2);
      expect(res.body.adminIds).toContainEqual(user.id);
      expect(res.body.adminIds).toContainEqual(user2.id);
    });
  });

  /* ------------------------ */
  /* GET /events/:id/balances */
  /* ------------------------ */
  describe("GET /events/:id/balances", async () => {
    test("should get balance information for event with 2 users", async () => {
      const res = await request(app)
        .get(`/api/events/${event.id}/balances`)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.length).toEqual(2);
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            user: expect.objectContaining({
              username: user.username
            })
          }),
          expect.objectContaining({
            user: expect.objectContaining({
              username: user2.username
            })
          })
        ])
      );
    });

    test("should get balance information for event with 1 user", async () => {
      const res = await request(app)
        .get(`/api/events/${event2.id}/balances`)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            user: expect.objectContaining({
              username: "testuser"
            })
          })
        ])
      );
    });

    test("fail get balance information for private event", async () => {
      const res = await request(app)
        .get(`/api/events/${event2.id}/balances`)
        .set("Cookie", authToken2);

      expect(res.status).toEqual(403);
      expect(res.body.code).toEqual(ec.PUD138.code);
    });
  });

  /* ------------------------ */
  /* GET /events/:id/payments */
  /* ------------------------ */
  describe("GET /events/:id/payments", async () => {
    test("should get payments information with no payments", async () => {
      const res = await request(app)
        .get(`/api/events/${event.id}/payments`)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.length).toEqual(0);
    });

    test("fail get payments information for private event", async () => {
      const res = await request(app)
        .get(`/api/events/${event2.id}/payments`)
        .set("Cookie", authToken2);

        expect(res.status).toEqual(403);
        expect(res.body.code).toEqual(ec.PUD138.code);
    });
  });

  /* -------------------------------- */
  /* DELETE /events/:id/admin/:userId */
  /* -------------------------------- */
  describe("DELETE /events/:id/admin/:id", async () => {
    // Check that both user1 and user2 are event admins
    test("user1 and user2 should both be event admins", async () => {
      const res = await request(app)
        .get("/api/events/" + event.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.adminIds.length).toEqual(2);
      expect(res.body.adminIds).toContainEqual(user.id);
      expect(res.body.adminIds).toContainEqual(user2.id);
    });

    // Remove user2 as admin of event
    test("should remove user2 as event admin", async () => {
      const res = await request(app)
        .delete(`/api/events/${event.id}/admin/${user2.id}`)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
    });

    // Check that only user1 is event admin
    test("only user1 should be event admin", async () => {
      const res = await request(app)
        .get("/api/events/" + event.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.adminIds.length).toEqual(1);
      expect(res.body.adminIds[0]).toEqual(user.id);
    });

    // Should not be able to remove user1 as event admin as all events need at least one admin
    test("fail removal of only event admin as event admin", async () => {
      const res = await request(app)
        .delete(`/api/events/${event.id}/admin/${user.id}`)
        .set("Cookie", authToken);

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD093.code);
    });
  });

  /* ------------------------------- */
  /* DELETE /events/:id/user/:userId */
  /* ------------------------------- */
  describe("DELETE /events/:id/user/:id", async () => {
    // Check number of users in event (should be 2)
    test("number of users in event should be 2", async () => {
      const res = await request(app)
        .get("/api/users")
        .query("eventId=" + event.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.length).toEqual(2);
    });

    test("should set event as archived", async () => {
      const res = await request(app)
        .put("/api/events/" + event.id)
        .set("Cookie", authToken)
        .send({
          status: EventStatusType.ARCHIVED
        });

      expect(res.status).toEqual(200);
      expect(res.body.status.id).toEqual(EventStatusType.ARCHIVED);
    });

    test("fail removal of user2 in archived event", async () => {
      const res = await request(app)
        .delete(`/api/events/${event.id}/user/${user2.id}`)
        .set("Cookie", authToken);

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

    // Remove user2 from event
    test("should remove user2 from event", async () => {
      const res = await request(app)
        .delete(`/api/events/${event.id}/user/${user2.id}`)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
    });

    // Check number of users in event (should be 1)
    test("number of users in event should be 1", async () => {
      const res = await request(app)
        .get("/api/users")
        .query("eventId=" + event.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.length).toEqual(1);
    });

    // Should not be able to remove user1 from event as user1 is the sole event admin
    test("fail removal of only event admin from event", async () => {
      const res = await request(app)
        .delete(`/api/events/${event.id}/user/${user.id}`)
        .set("Cookie", authToken);

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD098.code);
    });

    test("fail removal of user1 in private event by user2 (who is not in event)", async () => {
      const res = await request(app)
        .delete(`/api/events/${event2.id}/user/${user.id}`)
        .set("Cookie", authToken2);

      expect(res.status).toEqual(403);
      expect(res.body.code).toEqual(ec.PUD138.code);
    });
  });

  /* ------------------ */
  /* DELETE /events/:id */
  /* ------------------ */
  describe("DELETE /events/:id", async () => {
    test("fail delete private event when logged in user is not in event", async () => {
      const res = await request(app)
        .delete("/api/events/" + event2.id)
        .set("Cookie", authToken2);

      expect(res.status).toEqual(403);
      expect(res.body.code).toEqual(ec.PUD138.code);
    });

    test("should delete event", async () => {
      const res = await request(app)
        .delete("/api/events/" + event2.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.success).toEqual(true);
    });

    test("fail delete event when logged in user is not event admin", async () => {
      const res = await request(app)
        .delete("/api/events/" + event.id)
        .set("Cookie", authToken2);

      expect(res.status).toEqual(403);
      expect(res.body.code).toEqual(ec.PUD085.code);
    });

    test("should set event as archived", async () => {
      const res = await request(app)
        .put("/api/events/" + event.id)
        .set("Cookie", authToken)
        .send({
          status: EventStatusType.ARCHIVED
        });

      expect(res.status).toEqual(200);
      expect(res.body.status.id).toEqual(EventStatusType.ARCHIVED);
    });

    test("fail delete archived event", async () => {
      const res = await request(app)
        .delete("/api/events/" + event.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(400);
      expect(res.body.code).toEqual(ec.PUD119.code);
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

    test("should delete event", async () => {
      const res = await request(app)
        .delete("/api/events/" + event.id)
        .set("Cookie", authToken);

      expect(res.status).toEqual(200);
      expect(res.body.success).toEqual(true);
    });
  });
});
