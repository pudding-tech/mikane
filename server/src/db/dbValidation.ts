import { pool } from "../db";
import { ErrorExt } from "../types/errorExt";
import { PUD006 } from "../types/errorCodes";

/* ---- */
/* USER */
/* ---- */

/**
 * DB interface: Check if a username is available
 * @param username
 * @param userId Provide user ID if checking against a specific user
 * @returns True if username is available
 */
export const validateUsername = async (username: string, userId?: string) => {
  const query = {
    text: `
      SELECT false AS available FROM "user" u WHERE u.username ILIKE $1 AND ($2::uuid is null OR u.id != $2::uuid);
    `,
    values: [username, userId]
  };
  const data = await pool.query(query);
  if (data.rows[0] && data.rows[0].available === false) {
    return false;
  }
  return true;
};

/**
 * DB interface: Check if a user email is available
 * @param email
 * @param userId Provide user ID if checking against a specific user
 * @returns True if email is available
 */
export const validateEmail = async (email: string, userId?: string) => {
  const query = {
    text: `
      SELECT false AS available FROM "user" u WHERE u.email ILIKE $1 AND ($2::uuid is null OR u.id != $2::uuid);
    `,
    values: [email, userId]
  };
  const data = await pool.query(query);
  if (data.rows[0] && data.rows[0].available === false) {
    return false;
  }
  return true;
};

/**
 * DB interface: Check if a user phone number is available
 * @param phoneNumber
 * @param userId Provide user ID if checking against a specific user
 * @returns True if phone number is available
 */
export const validatePhoneNumber = async (phoneNumber: string, userId?: string) => {
  const query = {
    text: `
      SELECT false AS available FROM "user" u WHERE u.phone_number ILIKE $1 AND ($2::uuid is null OR u.id != $2::uuid);
    `,
    values: [phoneNumber, userId]
  };
  const data = await pool.query(query);
  if (data.rows[0] && data.rows[0].available === false) {
    return false;
  }
  return true;
};

/* ----- */
/* EVENT */
/* ----- */

/**
 * DB interface: Check if a event name is available
 * @param name
 * @param userId Provide event ID if checking against a specific event
 * @returns True if event name is available
 */
export const validateEventName = async (name: string, eventId?: string) => {
  const query = {
    text: `
      SELECT false AS available FROM "event" e WHERE e.name ILIKE $1 AND ($2::uuid is null OR e.id != $2::uuid);
    `,
    values: [name, eventId]
  };
  const data = await pool.query(query);
  if (data.rows[0] && data.rows[0].available === false) {
    return false;
  }
  return true;
};

/* -------- */
/* CATEGORY */
/* -------- */

/**
 * DB interface: Check if a category name is available within an event
 * @param name
 * @param eventId
 * @param userId Provide category ID if checking against a specific category
 * @returns True if category name is available
 */
export const validateCategoryName = async (name: string, eventId: string, categoryId?: string) => {
  const queryEventCheck = {
    text: `
      SELECT true AS exists FROM "event" e WHERE e.id = $1;
    `,
    values: [eventId]
  };
  await pool.query(queryEventCheck)
    .then(data => {
      if (!data.rows[0]) {
        throw new ErrorExt(PUD006);
      }
    });

  const query = {
    text: `
      SELECT false AS available FROM category c WHERE c.name ILIKE $1 AND c.event_id = $2 AND ($3::uuid is null OR c.id != $3::uuid);
    `,
    values: [name, eventId, categoryId]
  };
  const data = await pool.query(query);
  if (data.rows[0] && data.rows[0].available === false) {
    return false;
  }
  return true;
};
