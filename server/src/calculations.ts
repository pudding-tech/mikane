import {
  User,
  Category,
  Expense,
  Payment,
  Record,
  BalanceCalculationResult
} from "./types/types";

/**
 * Calculate an event's balance
 * @param expenses List of expenses in event
 * @param categories List of categories in event
 * @param users List of users in event
 * @returns Balance Calculation Result
 */
export const calculateBalance = (
  expenses: Expense[],
  categories: Category[],
  users: User[]
): BalanceCalculationResult => {
  const balance: Record[] = [];
  const spending: Record[] = [];
  const expensesOutput: Record[] = [];
  const categoryWeights = new Map<string, Map<string, number>>();
  const userNetExpense = new Map<string, number>();

  categories.forEach((category) => {
    if (!category.userWeights) {
      return console.log("Category object formatted wrong!");
    }
    let sumCategoryWeights = 0;
    category.userWeights.forEach((weight) => {
      sumCategoryWeights += weight;
    });
    const adjustedUserWeights = new Map<string, number>();
    category.userWeights.forEach((weight, user) => {
      adjustedUserWeights.set(user, weight / sumCategoryWeights);
    });
    categoryWeights.set(category.id, adjustedUserWeights);
  });

  const spendingMap = new Map<string, number>();
  const expensesOutputMap = new Map<string, number>();
  expenses.forEach((expense) => {
    expensesOutputMap.set(
      expense.payer.id,
      (expensesOutputMap.get(expense.payer.id) ?? 0) + expense.amount
    );
    userNetExpense.set(
      expense.payer.id,
      (userNetExpense.get(expense.payer.id) ?? 0) + expense.amount
    );
    const expenseCategory = categoryWeights.get(expense.categoryInfo.id);
    if (expenseCategory) {
      expenseCategory.forEach((userWeight: number, userId: string) => {
        spendingMap.set(
          userId,
          (spendingMap.get(userId) ?? 0) - expense.amount * userWeight
        );
        userNetExpense.set(
          userId,
          (userNetExpense.get(userId) ?? 0) - expense.amount * userWeight
        );
      });
    }
  });

  userNetExpense.forEach((netExpense: number, userId: string) => {
    const user = users.find((user) => {
      return user.id == userId;
    });
    if (user !== undefined) {
      spending.push({
        user: user,
        amount: roundAmount(spendingMap.get(userId) ?? 0),
      });
      expensesOutput.push({
        user: user,
        amount: roundAmount(expensesOutputMap.get(userId) ?? 0),
      });
      balance.push({ user: user, amount: roundAmount(netExpense) });
    }
  });

  return {
    balance: balance,
    spending: spending,
    expenses: expensesOutput
  };
};

/**
 * Calculate payments for an event
 * @param expenses List of expenses in event
 * @param categories List of categories in event
 * @param users List of users in event
 * @returns List of payments for event
 */
export const calculatePayments = (
  expenses: Expense[],
  categories: Category[],
  users: User[]
): Payment[] => {
  const payments: Payment[] = [];

  const balanceResults = calculateBalance(expenses, categories, users);

  const lenders: Record[] = [];
  const debtors: Record[] = [];
  balanceResults.balance.forEach((record: Record) => {
    if (record.amount > 0) {
      lenders.push(record);
    } else if (record.amount < 0) {
      debtors.push({
        user: record.user,
        amount: Math.abs(record.amount),
      });
    }
  });

  while (lenders.length > 0 && debtors.length > 0) {
    lenders.sort((a, b) => (a.amount > b.amount ? 1 : -1));
    debtors.sort((a, b) => (a.amount > b.amount ? 1 : -1));
    const largestLeander = lenders.pop();
    const largestDebtor = debtors.pop();

    if (!largestLeander || !largestDebtor) {
      break;
    }

    let paymentAmount = 0;
    if (largestLeander.amount > largestDebtor.amount) {
      paymentAmount = largestDebtor.amount;
      lenders.push({
        user: largestLeander.user,
        amount: largestLeander.amount - largestDebtor.amount,
      });
    } else if (largestLeander.amount < largestDebtor.amount) {
      paymentAmount = largestLeander.amount;
      debtors.push({
        user: largestDebtor.user,
        amount: largestDebtor.amount - largestLeander.amount,
      });
    } else {
      paymentAmount = largestDebtor.amount;
    }

    payments.push({
      sender: largestDebtor.user,
      receiver: largestLeander.user,
      amount: roundAmount(paymentAmount),
    });
  }

  return payments;
};

const roundAmount = (amount: number): number => {
  return +amount.toFixed(2);
};
