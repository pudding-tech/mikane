import { pool } from "../db";
import { ErrorExt } from "../types/errorExt";
import { PUD006 } from "../types/errorCodes";

/* ---- */
/* USER */
/* ---- */

/**
 * DB interface: Check if a username is available
 * @param username
 * @returns True if username is available
 */
export const validateUsername = async (username: string) => {
  const query = {
    text: `
      SELECT false AS available FROM "user" u WHERE u.username ILIKE $1;
    `,
    values: [username]
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
 * @returns True if email is available
 */
export const validateEmail = async (email: string) => {
  const query = {
    text: `
      SELECT false AS available FROM "user" u WHERE u.email ILIKE $1;
    `,
    values: [email]
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
 * @returns True if phone number is available
 */
export const validatePhoneNumber = async (phoneNumber: string) => {
  const query = {
    text: `
      SELECT false AS available FROM "user" u WHERE u.phone_number ILIKE $1;
    `,
    values: [phoneNumber]
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
 * @returns True if event name is available
 */
export const validateEventName = async (name: string) => {
  const query = {
    text: `
      SELECT false AS available FROM "event" e WHERE e.name ILIKE $1;
    `,
    values: [name]
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
 * @returns True if category name is available
 */
export const validateCategoryName = async (name: string, eventId: string) => {
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
      SELECT false AS available FROM category c WHERE c.name ILIKE $1 AND c.event_id = $2;
    `,
    values: [name, eventId]
  };
  const data = await pool.query(query);
  if (data.rows[0] && data.rows[0].available === false) {
    return false;
  }
  return true;
};
