import { convertCurrency } from "../services/currencyExchangeService.ts";
import { Expense } from "../types/types.ts";

/**
 * Convert all expense amounts into the event currency.
 * @param expenses List of expenses
 * @param eventCurrency Currency of the event
 * @returns List of expenses with amounts converted to the event currency
 */
export const convertExpensesToEventCurrency = async (expenses: Expense[], eventCurrency: string): Promise<Expense[]> => {
  return Promise.all(expenses.map(async (expense) => {
    const sourceCurrency = expense.currency ?? eventCurrency;
    if (sourceCurrency === eventCurrency) {
      return expense;
    }

    const conversionDate = expense.expenseDate ?? expense.created;
    const convertedAmount = await convertCurrency(expense.amount, sourceCurrency, eventCurrency, conversionDate);
    return {
      ...expense,
      amount: convertedAmount,
    };
  }));
};
