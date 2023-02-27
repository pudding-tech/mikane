import sql from "mssql";
import { calculateBalance, calculatePayments } from "../calculations";
import { parseBalance, parseCategories, parseExpenses, parseUsers } from "../parsers";
import { CategoryTarget } from "../types/enums";
import { BalanceCalculationResult, Category, Event, Expense, Payment, User, UserBalance } from "../types/types";

/**
 * DB interface: Get all events
 * @returns List of events
 */
export const getEvents = async () => {
  const request = new sql.Request();
  const events: Event[] = await request
    .input("event_id", sql.Int, null)
    .execute("get_events")
    .then(data => {
      return data.recordset;
    });
  return events;
};

/**
 * DB interface: Get specific event
 * @param eventId Event ID
 * @returns Events
 */
export const getEvent = async (eventId: number) => {
  const request = new sql.Request();
  const event: Event = await request
    .input("event_id", sql.Int, eventId)
    .execute("get_events")
    .then(data => {
      return data.recordset[0];
    });
  return event;
};

/**
 * DB interface: Get an event balance information for all users
 * @param eventId Event ID
 * @returns List of user balances for an event
 */
export const getEventBalances = async (eventId: number) => {
  const request = new sql.Request();
  const data = await request
    .input("event_id", sql.Int, eventId)
    .execute("get_event_payment_data")
    .then(res => {
      return res.recordsets as sql.IRecordSet<object>[];
    });
  
  if (!data || data.length < 3) {
    throw new Error("Something went wrong getting users, categories or expenses");
  }

  const users: User[] = parseUsers(data[0]);
  const categories: Category[] = parseCategories(data[1], CategoryTarget.CALC);
  const expenses: Expense[] = parseExpenses(data[2]);

  const balance: BalanceCalculationResult = calculateBalance(expenses, categories, users);
  const usersWithBalance: UserBalance[] = parseBalance(users, balance);
  return usersWithBalance;
};

/**
 * DB interface: Get an event payments information
 * @param eventId Event ID
 * @returns List of payments for an event
 */
export const getEventPayments = async (eventId: number) => {
  const request = new sql.Request();
  const data = await request
    .input("event_id", sql.Int, eventId)
    .execute("get_event_payment_data")
    .then(res => {
      return res.recordsets as sql.IRecordSet<object>[];
    });
  
  if (!data || data.length < 3) {
    throw new Error("Something went wrong getting users, categories or expenses");
  }

  const users: User[] = parseUsers(data[0]);
  const categories: Category[] = parseCategories(data[1], CategoryTarget.CALC);
  const expenses: Expense[] = parseExpenses(data[2]);

  const payments: Payment[] = calculatePayments(expenses, categories, users);
  return payments;
};

/**
 * DB interface: Add a new event to the database
 * @param name Name of event
 * @returns Newly created event
 */
export const createEvent = async (name: string) => {
  const request = new sql.Request();
  const event: Event = await request
    .input("name", sql.NVarChar, name)
    .execute("new_event")
    .then(data => {
      return data.recordset[0];
    });
  return event;
};

/**
 * DB interface: Delete an event from the database
 * @param id Event ID
 * @returns True if successful
 */
export const deleteEvent = async (id: number) => {
  const request = new sql.Request();
  const success = await request
    .input("event_id", sql.Int, id)
    .execute("delete_event")
    .then(() => {
      return true;
    });
  return success;
};
