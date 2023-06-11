import sql from "mssql";
import { calculateBalance, calculatePayments } from "../calculations";
import { parseBalance, parseEvents, parseCategories, parseExpenses, parseUsers } from "../parsers";
import { BalanceCalculationResult, Category, Event, Expense, Payment, User, UserBalance } from "../types/types";
import { Target } from "../types/enums";
import { ErrorExt } from "../types/errorExt";
import * as ec from "../types/errorCodes";

/**
 * DB interface: Get all events
 * @param userId Get user specific information about events (optional)
 * @returns List of events
 */
export const getEvents = async (userId?: number) => {
  const request = new sql.Request();
  const events: Event[] = await request
    .input("event_id", sql.Int, null)
    .input("user_id", sql.Int, userId)
    .execute("get_events")
    .then(data => {
      return parseEvents(data.recordset);
    })
    .catch(err => {
      throw new ErrorExt(ec.PUD031, err);
    });
  return events;
};

/**
 * DB interface: Get specific event
 * @param eventId Event ID
 * @param userId Get user specific information about event (optional)
 * @returns Event
 */
export const getEvent = async (eventId: number, userId?: number) => {
  const request = new sql.Request();
  const events: Event[] = await request
    .input("event_id", sql.Int, eventId)
    .input("user_id", sql.Int, userId)
    .execute("get_events")
    .then(data => {
      return parseEvents(data.recordset);
    })
    .catch(err => {
      throw new ErrorExt(ec.PUD031, err);
    });
  if (!events.length) {
    return null;
  }
  return events[0];
};

/**
 * DB interface: Get specific event by name
 * @param eventId Event name
 * @param userId Get user specific information about event (optional)
 * @returns Event
 */
export const getEventByName = async (eventName: string, userId?: number) => {
  const request = new sql.Request();
  const events: Event[] = await request
    .input("event_name", sql.NVarChar, eventName)
    .input("user_id", sql.Int, userId)
    .execute("get_event_by_name")
    .then(data => {
      return parseEvents(data.recordset);
    })
    .catch(err => {
      throw new ErrorExt(ec.PUD031, err);
    });
  if (!events.length) {
    return null;
  }
  return events[0];
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
      return res.recordsets as sql.IRecordSet<any>[];
    })
    .catch(err => {
      if (err.number === 50006)
        throw new ErrorExt(ec.PUD006, err);
      else if (err.number === 50008)
        throw new ErrorExt(ec.PUD008, err);
      else if (err.number === 50084)
        throw new ErrorExt(ec.PUD084, err);
      else
        throw new ErrorExt(ec.PUD030, err);
    });
  
  if (!data || data.length < 3) {
    throw new ErrorExt(ec.PUD061);
  }

  const users: User[] = parseUsers(data[0], true);
  const categories: Category[] = parseCategories(data[1], Target.CALC);
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
      return res.recordsets as sql.IRecordSet<any>[];
    })
    .catch(err => {
      if (err.number === 50006)
        throw new ErrorExt(ec.PUD006, err);
      else if (err.number === 50008)
        throw new ErrorExt(ec.PUD008, err);
      else if (err.number === 50084)
        throw new ErrorExt(ec.PUD084, err);
      else
        throw new ErrorExt(ec.PUD030, err);
    });
  
  if (!data || data.length < 3) {
    throw new ErrorExt(ec.PUD061);
  }

  const users: User[] = parseUsers(data[0], false);
  const categories: Category[] = parseCategories(data[1], Target.CALC);
  const expenses: Expense[] = parseExpenses(data[2]);

  const payments: Payment[] = calculatePayments(expenses, categories, users);
  return payments;
};

/**
 * DB interface: Add a new event to the database
 * @param name Name of event
 * @param userId ID of user creating event
 * @param private Whether event should be open for all or invite only
 * @param description Description of event (optional)
 * @returns Newly created event
 */
export const createEvent = async (name: string, userId: number, privateEvent: boolean, description?: string) => {
  const request = new sql.Request();
  const events: Event[] = await request
    .input("name", sql.NVarChar, name)
    .input("description", sql.NVarChar, description)
    .input("user_id", sql.Int, userId)
    .input("private", sql.Bit, privateEvent)
    .input("active", sql.Bit, 1)
    .input("usernames_only", sql.Bit, 0)
    .execute("new_event")
    .then(data => {
      return parseEvents(data.recordset);
    })
    .catch(err => {
      if (err.number === 50005)
        throw new ErrorExt(ec.PUD005, err);
      else if (err.number === 50008)
        throw new ErrorExt(ec.PUD008, err);
      else
        throw new ErrorExt(ec.PUD037, err);
    });
  return events[0];
};

/**
 * DB interface: Delete an event from the database
 * @param id Event ID
 * @returns True if successful
 */
export const deleteEvent = async (id: number, userId: number) => {
  const request = new sql.Request();
  const success = await request
    .input("event_id", sql.Int, id)
    .input("user_id", sql.Int, userId)
    .execute("delete_event")
    .then(() => {
      return true;
    })
    .catch(err => {
      if (err.number === 50006)
        throw new ErrorExt(ec.PUD006, err);
      else if (err.number === 50085)
        throw new ErrorExt(ec.PUD085, err);
      else
        throw new ErrorExt(ec.PUD023, err);
    });
  return success;
};

/**
 * DB interface: Add user to an event
 * @param eventId 
 * @param userId 
 * @returns Affected event
 */
export const addUserToEvent = async (eventId: number, userId: number) => {
  const request = new sql.Request();
  const events: Event[] = await request
    .input("event_id", sql.Int, eventId)
    .input("user_id", sql.Int, userId)
    .execute("add_user_to_event")
    .then(data => {
      return parseEvents(data.recordset);
    })
    .catch(err => {
      if (err.number === 50006) 
        throw new ErrorExt(ec.PUD006, err);
      else if (err.number === 50008)
        throw new ErrorExt(ec.PUD008, err);
      else if (err.number === 50009)
        throw new ErrorExt(ec.PUD009, err);
      else
        throw new ErrorExt(ec.PUD021, err);
    });
  return events[0];
};

/**
 * DB interface: Remove a user from an event
 * @param eventId  
 * @param userId 
 * @returns Affected event
 */
export const removeUserFromEvent = async (eventId: number, userId: number) => {
  const request = new sql.Request();
  const events: Event[] = await request
    .input("event_id", sql.Int, eventId)  
    .input("user_id", sql.Int, userId)  
    .execute("remove_user_from_event")
    .then(data => {
      return parseEvents(data.recordset);
    })
    .catch(err => {
      if (err.number === 50006) 
        throw new ErrorExt(ec.PUD006, err);
      else if (err.number === 50008)
        throw new ErrorExt(ec.PUD008, err);
      else
        throw new ErrorExt(ec.PUD040, err);
    });
  return events[0];
};

/**
 * DB interface: Edit event
 * @param eventId ID of event to edit
 * @param userId ID of user performing edit
 * @param name New name
 * @param description New description
 * @param adminId New admin user ID
 * @param privateEvent Whether event should be open for all or invite only
 * @returns Edited event
 */
export const editEvent = async (eventId: number, userId: number, name?: string, description?: string, adminId?: number, privateEvent?: boolean) => {
  const request = new sql.Request();
  const events: Event[] = await request
    .input("event_id", sql.Int, eventId)
    .input("user_id", sql.Int, userId)
    .input("name", sql.NVarChar, name)
    .input("description", sql.NVarChar, description)
    .input("admin_id", sql.Int, adminId)
    .input("private", sql.Bit, privateEvent)
    .execute("edit_event")
    .then(data => {
      return parseEvents(data.recordset);
    })
    .catch(err => {
      if (err.number === 50006)
        throw new ErrorExt(ec.PUD006, err);
      else if (err.number === 50005)
        throw new ErrorExt(ec.PUD005, err);
      else if (err.number === 50008)
        throw new ErrorExt(ec.PUD008, err);
      else if (err.number === 50087)
        throw new ErrorExt(ec.PUD087, err);
      else
        throw new ErrorExt(ec.PUD044, err);
    });
  if (!events.length) {
    return null;
  }
  return events[0];
};
