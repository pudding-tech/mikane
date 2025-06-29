import { pool } from "../db.ts";
import { parseExpenses } from "../parsers/parseExpenses.ts";
import { ErrorExt } from "../types/errorExt.ts";
import { Expense } from "../types/types.ts";
import * as ec from "../types/errorCodes.ts";

/**
 * DB interface: Get all expenses in a given event
 * @param eventId 
 * @param activeUserId ID of signed-in user
 * @returns List of expenses
 */
export const getExpenses = async (eventId: string, activeUserId: string) => {
  const query = {
    text: "SELECT * FROM get_expenses($1, null, null, $2);",
    values: [eventId, activeUserId]
  };
  const query2 = {
    text: "SELECT * FROM get_users_name($1, null);",
    values: [eventId]
  };

  const expenses: Expense[] = await Promise.all([query, query2].map(query => pool.query(query)))
    .then(data => {
      return parseExpenses(data[0].rows, data[1].rows);
    })
    .catch(err => {
      if (err.code === "P0006")
        throw new ErrorExt(ec.PUD006, err);
      else if (err.code === "P0008")
        throw new ErrorExt(ec.PUD008, err);
      else if (err.code === "P0084")
        throw new ErrorExt(ec.PUD084, err);
      else if (err.code === "P0138")
        throw new ErrorExt(ec.PUD138, err);
      else
        throw new ErrorExt(ec.PUD032, err);
    });

  return expenses;
};

/**
 * DB interface: Get a specific expense
 * @param expenseId 
 * @param activeUserId ID of signed-in user
 * @returns Expense object
 */
export const getExpense = async (expenseId: string, activeUserId: string) => {
  const query = {
    text: "SELECT * FROM get_expenses(null, null, $1, $2);",
    values: [expenseId, activeUserId]
  };
  const expenses: Expense[] = await pool.query(query)
    .then(data => {
      return parseExpenses(data.rows);
    })
    .catch(err => {
      if (err.code === "P0006")
        throw new ErrorExt(ec.PUD006, err);
      else if (err.code === "P0008")
        throw new ErrorExt(ec.PUD008, err);
      else if (err.code === "P0084")
        throw new ErrorExt(ec.PUD084, err);
      else if (err.code === "P0138")
        throw new ErrorExt(ec.PUD138, err);
      else
        throw new ErrorExt(ec.PUD032, err);
    });

  if (!expenses.length) {
    return null;
  }
  return expenses[0];
};

/**
 * DB interface: Add a new expense to the database
 * @param activeUserId ID of signed-in user
 * @param name 
 * @param amount 
 * @param categoryId 
 * @param payerId 
 * @param description 
 * @param expenseDate 
 * @returns Newly created expense
 */
export const createExpense = async (activeUserId: string, name: string, amount: number, categoryId: string, payerId: string, description?: string, expenseDate?: Date) => {
  const query = {
    text: "SELECT * FROM new_expense($1, $2, $3, $4, $5, $6, $7);",
    values: [name, description, amount, categoryId, payerId, expenseDate, activeUserId]
  };
  const expenses: Expense[] = await pool.query(query)
    .then(data => {
      return parseExpenses(data.rows);
    })
    .catch(err => {
      if (err.code === "P0007")
        throw new ErrorExt(ec.PUD007, err);
      else if (err.code === "P0008")
        throw new ErrorExt(ec.PUD008, err);
      else if (err.code === "P0062")
        throw new ErrorExt(ec.PUD062, err);
      else if (err.code === "P0118")
        throw new ErrorExt(ec.PUD118, err);
      else if (err.code === "P0138")
        throw new ErrorExt(ec.PUD138, err);
      else
        throw new ErrorExt(ec.PUD043, err);
    });

  return expenses[0];
};

/**
 * DB interface: Edit (replace) an expense
 * @param expenseId Expense ID to edit
 * @param activeUserId ID of signed-in user
 * @param data Data object
 * @returns Edited expense
 */
export const editExpense = async (expenseId: string, activeUserId: string, data: { name: string, description?: string, amount: number, categoryId: string, payerId: string, expenseDate?: Date }) => {
  const query = {
    text: "SELECT * FROM edit_expense(true, $1, $2, $3, $4, $5, $6, $7, $8);",
    values: [expenseId, data.name, data.description, data.amount, data.categoryId, data.payerId, data.expenseDate, activeUserId]
  };
  const expense: Expense[] = await pool.query(query)
    .then(data => {
      return parseExpenses(data.rows);
    })
    .catch(err => {
      if (err.code === "P0084")
        throw new ErrorExt(ec.PUD084, err);
      else if (err.code === "P0007")
        throw new ErrorExt(ec.PUD007, err);
      else if (err.code === "P0008")
        throw new ErrorExt(ec.PUD008, err);
      else if (err.code === "P0062")
        throw new ErrorExt(ec.PUD062, err);
      else if (err.code === "P0118")
        throw new ErrorExt(ec.PUD118, err);
      else if (err.code === "P0138")
        throw new ErrorExt(ec.PUD138, err);
      else
        throw new ErrorExt(ec.PUD117, err);
    });

  return expense[0];
};

/**
 * DB interface: Edit (patch) an expense
 * @param expenseId Expense ID to edit
 * @param activeUserId ID of signed-in user
 * @param data Data object
 * @returns Edited expense
 */
export const patchExpense = async (expenseId: string, activeUserId: string, data: { name?: string, description?: string, amount?: number, categoryId?: string, payerId?: string, expenseDate?: Date }) => {
  const query = {
    text: "SELECT * FROM edit_expense(false, $1, $2, $3, $4, $5, $6, $7, $8);",
    values: [expenseId, data.name, data.description, data.amount, data.categoryId, data.payerId, data.expenseDate, activeUserId]
  };
  const expense: Expense[] = await pool.query(query)
    .then(data => {
      return parseExpenses(data.rows);
    })
    .catch(err => {
      if (err.code === "P0084")
        throw new ErrorExt(ec.PUD084, err);
      else if (err.code === "P0007")
        throw new ErrorExt(ec.PUD007, err);
      else if (err.code === "P0008")
        throw new ErrorExt(ec.PUD008, err);
      else if (err.code === "P0062")
        throw new ErrorExt(ec.PUD062, err);
      else if (err.code === "P0118")
        throw new ErrorExt(ec.PUD118, err);
      else if (err.code === "P0138")
        throw new ErrorExt(ec.PUD138, err);
      else
        throw new ErrorExt(ec.PUD117, err);
    });

  return expense[0];
};

/**
 * DB interface: Delete an expense
 * @param expenseId 
 * @param activeUserId ID of signed-in user
 * @returns True if successful
 */
export const deleteExpense = async (expenseId: string, activeUserId: string) => {
  const query = {
    text: "SELECT * FROM delete_expense($1, $2);",
    values: [expenseId, activeUserId]
  };
  const success = await pool.query(query)
    .then(() => {
      return true;
    })
    .catch(err => {
      if (err.code === "P0084")
        throw new ErrorExt(ec.PUD084, err);
      else if (err.code === "P0086")
        throw new ErrorExt(ec.PUD086, err);
      else if (err.code === "P0118")
        throw new ErrorExt(ec.PUD118, err);
      else if (err.code === "P0138")
        throw new ErrorExt(ec.PUD138, err);
      else
        throw new ErrorExt(ec.PUD024, err);
    });

  return success;
};
