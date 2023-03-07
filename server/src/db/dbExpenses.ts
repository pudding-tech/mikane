import sql from "mssql";
import { parseExpenses } from "../parsers";
import { ErrorExt } from "../types/errorExt";
import { Expense } from "../types/types";
import * as ec from "../types/errorCodes";

/**
 * DB interface: Get all expenses in a given event
 * @param eventId 
 * @returns List of expenses
 */
export const getExpenses = async (eventId: number) => {
  const request = new sql.Request();
  const expenses: Expense[] = await request
    .input("event_id", sql.Int, eventId)
    .input("user_id", sql.Int, null)
    .input("expense_id", sql.Int, null)
    .execute("get_expenses")
    .then(data => {
      return parseExpenses(data.recordset);
    })
    .catch(err => {
      console.log(err);
      throw new ErrorExt(ec.PUD032);
    });
  return expenses;
};

/**
 * DB interface: Get a specific expense
 * @param expenseId 
 * @returns Expense object
 */
export const getExpense = async (expenseId: number) => {
  const request = new sql.Request();
  const expenses: Expense[] = await request
    .input("event_id", sql.Int, null)
    .input("user_id", sql.Int, null)
    .input("expense_id", sql.Int, expenseId)
    .execute("get_expenses")
    .then(data => {
      return parseExpenses(data.recordset);
    })
    .catch(err => {
      console.log(err);
      throw new ErrorExt(ec.PUD032);
    });
  return expenses[0];
};

/**
 * DB interface: Add a new expense to the database
 * @param name 
 * @param description 
 * @param amount 
 * @param categoryId 
 * @param payerId 
 * @returns Newly created expense
 */
export const createExpense = async (name: string, description: string, amount: number, categoryId: number, payerId: number) => {
  const request = new sql.Request();
  const expenses: Expense[] = await request
    .input("name", sql.NVarChar, name)
    .input("description", sql.NVarChar, description)
    .input("amount", sql.Numeric(16, 2), amount)
    .input("category_id", sql.Int, categoryId)
    .input("payer_id", sql.Int, payerId)
    .execute("new_expense")
    .then(data => {
      return parseExpenses(data.recordset);
    })
    .catch(err => {
      console.log(err);
      throw new ErrorExt(ec.PUD043);
    });
  return expenses[0];
};

/**
 * DB interface: Delete an expense
 * @param expenseId 
 * @returns True if successful
 */
export const deleteExpense = async (expenseId: number) => {
  const request = new sql.Request();
  const success = await request
    .input("expense_id", sql.Int, expenseId)
    .execute("delete_expense")
    .then(() => {
      return true;
    })
    .catch(err => {
      console.log(err);
      throw new ErrorExt(ec.PUD024);
    });
  return success;
};
