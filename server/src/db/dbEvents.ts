import { pool } from "../db.ts";
import { calculateBalance, calculatePayments } from "../calculations.ts";
import { parseBalance, parseEvents } from "../parsers/parseEvents.ts";
import { parseCategories } from "../parsers/parseCategories.ts";
import { parseExpenses } from "../parsers/parseExpenses.ts";
import { parseUsers } from "../parsers/parseUsers.ts";
import { BalanceCalculationResult, Category, Event, Expense, Payment, User, UserBalance } from "../types/types.ts";
import { EventStatusType, Target } from "../types/enums.ts";
import { ErrorExt } from "../types/errorExt.ts";
import * as ec from "../types/errorCodes.ts";

/**
 * DB interface: Get all events
 * @param userId Get user specific information about events (optional)
 * @returns List of events
 */
export const getEvents = async (userId?: string) => {
  const query = {
    text: "SELECT * FROM get_events(null, $1, false, false);",
    values: [userId]
  };
  const events: Event[] = await pool.query(query)
    .then(data => {
      return parseEvents(data.rows);
    })
    .catch(err => {
      if (err.code === "P0008")
        throw new ErrorExt(ec.PUD008, err);
      else
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
export const getEvent = async (eventId: string, userId?: string) => {
  const query = {
    text: "SELECT * FROM get_events($1, $2, false, false);",
    values: [eventId, userId]
  };
  const events: Event[] = await pool.query(query)
    .then(data => {
      return parseEvents(data.rows);
    })
    .catch(err => {
      if (err.code === "P0006")
        throw new ErrorExt(ec.PUD006, err);
      else if (err.code === "P0008")
        throw new ErrorExt(ec.PUD008, err);
      else if (err.code === "P0138")
        throw new ErrorExt(ec.PUD138, err);
      else
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
 * @param authIsApiKey True if auth uses an API key instead of signing in
 * @returns Event
 */
export const getEventByName = async (eventName: string, userId?: string, authIsApiKey?: boolean) => {
  const query = {
    text: "SELECT * FROM get_event_by_name($1, $2, $3);",
    values: [eventName, userId, authIsApiKey]
  };
  const events: Event[] = await pool.query(query)
    .then(data => {
      return parseEvents(data.rows);
    })
    .catch(err => {
      if (err.code === "P0006")
        throw new ErrorExt(ec.PUD006, err);
      else if (err.code === "P0008")
        throw new ErrorExt(ec.PUD008, err);
      else if (err.code === "P0138")
        throw new ErrorExt(ec.PUD138, err);
      else
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
 * @param activeUserId ID of signed-in user
 * @returns List of user balances for an event
 */
export const getEventBalances = async (eventId: string, activeUserId?: string) => {
  const queryUsers = {
    text: `
      SELECT * FROM get_users($1, null, null, $2);
    `,
    values: [eventId, activeUserId]
  };
  const queryCategories = {
    text: `
      SELECT * FROM get_categories($1, null, $2);
    `,
    values: [eventId, activeUserId]
  };
  const queryExpenses = {
    text: `
      SELECT * FROM get_expenses($1, null, null, $2);
    `,
    values: [eventId, activeUserId]
  };

  try {
    const queries = [queryUsers, queryCategories, queryExpenses];
    const queryPromises = queries.map(query => pool.query(query));
    
    const res = await Promise.all(queryPromises);
    if (!res || res.length < 3) {
      throw new ErrorExt(ec.PUD061);
    }

    const users: User[] = parseUsers(res[0].rows, true, false, 100);
    const categories: Category[] = parseCategories(res[1].rows, Target.CALC);
    const expenses: Expense[] = parseExpenses(res[2].rows);

    const balance: BalanceCalculationResult = calculateBalance(expenses, categories, users);
    const usersWithBalance: UserBalance[] = parseBalance(balance, users, expenses);
    return usersWithBalance;
  }
  catch (err: any) {
    if (err.code === "P0006")
      throw new ErrorExt(ec.PUD006, err);
    else if (err.code === "P0008")
      throw new ErrorExt(ec.PUD008, err);
    else if (err.code === "P0084")
      throw new ErrorExt(ec.PUD084, err);
    else if (err.code === "P0138")
      throw new ErrorExt(ec.PUD138, err);
    else
      throw new ErrorExt(ec.PUD061, err);
  }
};

/**
 * DB interface: Get an event payments information
 * @param eventId Event ID
 * @param activeUserId ID of signed-in user
 * @returns List of payments for an event
 */
export const getEventPayments = async (eventId: string, activeUserId?: string) => {
  const queryUsers = {
    text: `
      SELECT * FROM get_users($1, null, null, $2);
    `,
    values: [eventId, activeUserId]
  };
  const queryCategories = {
    text: `
      SELECT * FROM get_categories($1, null, $2);
    `,
    values: [eventId, activeUserId]
  };
  const queryExpenses = {
    text: `
      SELECT * FROM get_expenses($1, null, null, $2);
    `,
    values: [eventId, activeUserId]
  };

  try {
    const queries = [queryUsers, queryCategories, queryExpenses];
    const queryPromises = queries.map(query => pool.query(query));

    const res = await Promise.all(queryPromises);
    if (!res || res.length < 3) {
      throw new ErrorExt(ec.PUD061);
    }

    const users: User[] = parseUsers(res[0].rows, false, false, 100);
    const categories: Category[] = parseCategories(res[1].rows, Target.CALC);
    const expenses: Expense[] = parseExpenses(res[2].rows);

    const payments: Payment[] = calculatePayments(expenses, categories, users);
    return payments;
  }
  catch (err: any) {
    if (err.code === "P0006")
      throw new ErrorExt(ec.PUD006, err);
    else if (err.code === "P0008")
      throw new ErrorExt(ec.PUD008, err);
    else if (err.code === "P0084")
      throw new ErrorExt(ec.PUD084, err);
    else if (err.code === "P0138")
      throw new ErrorExt(ec.PUD138, err);
    else
      throw new ErrorExt(ec.PUD061, err);
  }
};

/**
 * DB interface: Add a new event to the database
 * @param name Name of event
 * @param activeUserId ID of user creating event
 * @param private Whether event should be open for all or invite only
 * @param description Description of event (optional)
 * @returns Newly created event
 */
export const createEvent = async (name: string, activeUserId: string, privateEvent: boolean, description?: string) => {
  const query = {
    text: "SELECT * FROM new_event($1, $2, $3, $4, $5, $6);",
    values: [name, description, activeUserId, privateEvent, EventStatusType.ACTIVE, false]
  };
  const events: Event[] = await pool.query(query)
    .then(data => {
      return parseEvents(data.rows);
    })
    .catch(err => {
      if (err.code === "P0005")
        throw new ErrorExt(ec.PUD005, err);
      else if (err.code === "P0008")
        throw new ErrorExt(ec.PUD008, err);
      else if (err.code === "P0138")
        throw new ErrorExt(ec.PUD138, err);
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
export const deleteEvent = async (id: string, activeUserId: string) => {
  const query = {
    text: "SELECT * FROM delete_event($1, $2);",
    values: [id, activeUserId]
  };
  const success = await pool.query(query)
    .then(() => {
      return true;
    })
    .catch(err => {
      if (err.code === "P0006")
        throw new ErrorExt(ec.PUD006, err);
      else if (err.code === "P0085")
        throw new ErrorExt(ec.PUD085, err);
      else if (err.code === "P0119")
        throw new ErrorExt(ec.PUD119, err);
      else if (err.code === "P0138")
        throw new ErrorExt(ec.PUD138, err);
      else
        throw new ErrorExt(ec.PUD023, err);
    });

  return success;
};

/**
 * DB interface: Add user to an event
 * @param eventId 
 * @param userId 
 * @param activeUserId ID of signed-in user
 * @returns Affected event
 */
export const addUserToEvent = async (eventId: string, userId: string, activeUserId: string) => {
  const query = {
    text: "SELECT * FROM add_user_to_event($1, $2, $3, $4, false);",
    values: [eventId, userId, false, activeUserId]
  };
  const events: Event[] = await pool.query(query)
    .then(data => {
      return parseEvents(data.rows);
    })
    .catch(err => {
      if (err.code === "P0006") 
        throw new ErrorExt(ec.PUD006, err);
      else if (err.code === "P0008")
        throw new ErrorExt(ec.PUD008, err);
      else if (err.code === "P0009")
        throw new ErrorExt(ec.PUD009, err);
      else if (err.code === "P0118")
        throw new ErrorExt(ec.PUD118, err);
      else if (err.code === "P0138")
        throw new ErrorExt(ec.PUD138, err);
      else
        throw new ErrorExt(ec.PUD021, err);
    });

  return events[0];
};

/**
 * DB interface: Remove a user from an event
 * @param eventId  
 * @param userId 
 * @param activeUserId ID of signed-in user
 * @returns Affected event
 */
export const removeUserFromEvent = async (eventId: string, userId: string, activeUserId: string) => {
  const query = {
    text: "SELECT * FROM remove_user_from_event($1, $2, $3);",
    values: [eventId, userId, activeUserId]
  };
  const events: Event[] = await pool.query(query)
    .then(data => {
      return parseEvents(data.rows);
    })
    .catch(err => {
      if (err.code === "P0006") 
        throw new ErrorExt(ec.PUD006, err);
      else if (err.code === "P0008")
        throw new ErrorExt(ec.PUD008, err);
      else if (err.code === "P0098")
        throw new ErrorExt(ec.PUD098, err);
      else if (err.code === "P0114")
        throw new ErrorExt(ec.PUD114, err);
      else if (err.code === "P0118")
        throw new ErrorExt(ec.PUD118, err);
      else if (err.code === "P0138")
        throw new ErrorExt(ec.PUD138, err);
      else
        throw new ErrorExt(ec.PUD040, err);
    });

  return events[0];
};

/**
 * DB interface: Add user to as admin for an event
 * @param eventId 
 * @param userId 
 * @param activeUserId User ID of user performing the action
 * @returns Affected event
 */
export const addUserAsEventAdmin = async (eventId: string, userId: string, activeUserId: string) => {
  const query = {
    text: "SELECT * FROM add_user_as_event_admin($1, $2, $3);",
    values: [eventId, userId, activeUserId]
  };
  const events: Event[] = await pool.query(query)
    .then(data => {
      return parseEvents(data.rows);
    })
    .catch(err => {
      if (err.code === "P0006") 
        throw new ErrorExt(ec.PUD006, err);
      else if (err.code === "P0008")
        throw new ErrorExt(ec.PUD008, err);
      else if (err.code === "P0090")
        throw new ErrorExt(ec.PUD090, err);
      else if (err.code === "P0091")
        throw new ErrorExt(ec.PUD091, err);
      else if (err.code === "P0126")
        throw new ErrorExt(ec.PUD126, err);
      else if (err.code === "P0138")
        throw new ErrorExt(ec.PUD138, err);
      else
        throw new ErrorExt(ec.PUD094, err);
    });

  return events[0];
};

/**
 * DB interface: Remove user as admin for an event
 * @param eventId
 * @param userId
 * @param activeUserId User ID of user performing the action
 * @returns Affected event
 */
export const removeUserAsEventAdmin = async (eventId: string, userId: string, activeUserId: string) => {
  const query = {
    text: "SELECT * FROM remove_user_as_event_admin($1, $2, $3);",
    values: [eventId, userId, activeUserId]
  };
  const events: Event[] = await pool.query(query)
    .then(data => {
      return parseEvents(data.rows);
    })
    .catch(err => {
      if (err.code === "P0006") 
        throw new ErrorExt(ec.PUD006, err);
      else if (err.code === "P0008")
        throw new ErrorExt(ec.PUD008, err);
      else if (err.code === "P0092")
        throw new ErrorExt(ec.PUD092, err);
      else if (err.code === "P0093")
        throw new ErrorExt(ec.PUD093, err);
      else if (err.code === "P0138")
        throw new ErrorExt(ec.PUD138, err);
      else
        throw new ErrorExt(ec.PUD095, err);
    });

  return events[0];
};

/**
 * DB interface: Edit event
 * @param eventId ID of event to edit
 * @param activeUserId ID of user performing edit
 * @param name New name
 * @param description New description
 * @param privateEvent Whether event should be open for all or invite only
 * @param status Event status
 * @returns Edited event
 */
export const editEvent = async (eventId: string, activeUserId: string, name?: string, description?: string, privateEvent?: boolean, status?: number) => {
  const query = {
    text: "SELECT * FROM edit_event($1, $2, $3, $4, $5, $6);",
    values: [eventId, activeUserId, name, description, privateEvent, status]
  };
  const events: Event[] = await pool.query(query)
    .then(data => {
      return parseEvents(data.rows);
    })
    .catch(err => {
      if (err.code === "P0006")
        throw new ErrorExt(ec.PUD006, err);
      else if (err.code === "P0005")
        throw new ErrorExt(ec.PUD005, err);
      else if (err.code === "P0087")
        throw new ErrorExt(ec.PUD087, err);
      else if (err.code === "P0118")
        throw new ErrorExt(ec.PUD118, err);
      else if (err.code === "P0128")
        throw new ErrorExt(ec.PUD128, err);
      else if (err.code === "P0138")
        throw new ErrorExt(ec.PUD138, err);
      else
        throw new ErrorExt(ec.PUD044, err);
    });

  if (!events.length) {
    return null;
  }
  return events[0];
};
