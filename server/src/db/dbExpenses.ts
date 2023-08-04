import { pool } from "../db";
import { parseExpenses } from "../parsers/parseExpenses";
import { ErrorExt } from "../types/errorExt";
import { Expense } from "../types/types";
import * as ec from "../types/errorCodes";

/**
 * DB interface: Get all expenses in a given event
 * @param eventId 
 * @returns List of expenses
 */
export const getExpenses = async (eventId: string) => {
  const query = {
    text: "SELECT * FROM get_expenses($1, null, null);",
    values: [eventId]
  };
  const query2 = {
    text: "SELECT * FROM get_users_name($1, null)",
    values: [eventId]
  };

  const expenses: Expense[] = await Promise.all([query, query2].map(query => pool.query(query)))
    .then(data => {
      return parseExpenses(data[0].rows, data[1].rows);
    })
    .catch(err => {
      if (err.code === "P0006")
        throw new ErrorExt(ec.PUD006);
      else if (err.code === "P0008")
        throw new ErrorExt(ec.PUD008);
      else if (err.code === "P0084")
        throw new ErrorExt(ec.PUD084);
      else
        throw new ErrorExt(ec.PUD032, err);
    });

  return expenses;
};

/**
 * DB interface: Get a specific expense
 * @param expenseId 
 * @returns Expense object
 */
export const getExpense = async (expenseId: string) => {
  const query = {
    text: "SELECT * FROM get_expenses(null, null, $1);",
    values: [expenseId]
  };
  const expenses: Expense[] = await pool.query(query)
    .then(data => {
      return parseExpenses(data.rows);
    })
    .catch(err => {
      if (err.code === "P0006")
        throw new ErrorExt(ec.PUD006);
      else if (err.code === "P0008")
        throw new ErrorExt(ec.PUD008);
      else if (err.code === "P0084")
        throw new ErrorExt(ec.PUD084);
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
 * @param name 
 * @param amount 
 * @param categoryId 
 * @param payerId 
 * @param description 
 * @returns Newly created expense
 */
export const createExpense = async (name: string, amount: number, categoryId: string, payerId: string, description?: string) => {
  const query = {
    text: "SELECT * FROM new_expense($1, $2, $3, $4, $5);",
    values: [name, description, amount, categoryId, payerId]
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
      else
        throw new ErrorExt(ec.PUD043, err);
    });

  return expenses[0];
};

/**
 * DB interface: Edit an expense
 * @param userId Expense ID to edit
 * @param data Data object
 * @returns Edited expense
 */
export const editExpense = async (expenseId: string, data: { name?: string, description?: string, amount?: number, categoryId?: string, payerId?: string }) => {
  const query = {
    text: "SELECT * FROM edit_expense($1, $2, $3, $4, $5, $6)",
    values: [expenseId, data.name, data.description, data.amount, data.categoryId, data.payerId]
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
      else
        throw new ErrorExt(ec.PUD117, err);
    });

  return expense[0];
};

/**
 * DB interface: Delete an expense
 * @param expenseId 
 * @returns True if successful
 */
export const deleteExpense = async (expenseId: string, userId: string) => {
  const query = {
    text: "SELECT * FROM delete_expense($1, $2);",
    values: [expenseId, userId]
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
      else
        throw new ErrorExt(ec.PUD024, err);
    });

  return success;
};
