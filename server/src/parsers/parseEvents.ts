import { Event, User, UserBalance, BalanceCalculationResult, Expense } from "../types/types";
import { EventDB } from "../types/typesDB";

/**
 * Build array of Event objects
 * @param usersInput List of EventDB objects
 * @returns List of Event objects
 */
export const parseEvents = (eventsInput: EventDB[]) => {
  const events: Event[] = [];
  for (const eventObj of eventsInput) {
    const event: Event = {
      id: eventObj.id,
      name: eventObj.name,
      description: eventObj.description,
      created: eventObj.created,
      adminIds: eventObj.admin_ids.map(admin => admin.user_id),
      private: eventObj.private,
      status: {
        id: eventObj.status,
        name: eventObj.status_name
      },
      userInfo: eventObj.user_id && eventObj.user_in_event !== undefined && eventObj.user_is_admin !== undefined ? {
        id: eventObj.user_id,
        inEvent: eventObj.user_in_event,
        isAdmin: eventObj.user_is_admin
      } : undefined
    };
    events.push(event);
  }

  return events;
};

/**
 * Parse BalanceCalculationResult into a list of UserBalance objects
 * @param balanceRes Balance Calculation Result
 * @param users List of Users
 * @param users List of Expenses
 */
export const parseBalance = (balanceRes: BalanceCalculationResult, users: User[], expenses: Expense[]) => {
  const balances: UserBalance[] = [];
  users.forEach(user => {
    const expensesCount = expenses.filter(expense => expense.payer.id === user.id).length;
    for (let i = 0; i < balanceRes.balance.length; i++) {
      if (balanceRes.balance[i].user.id === user.id) {
        balances.push({
          user: user,
          expensesCount: expensesCount,
          spending: balanceRes.spending[i].amount,
          expenses: balanceRes.expenses[i].amount,
          balance: balanceRes.balance[i].amount
        });
        return;
      }
    }
    balances.push({
      user: user,
      expensesCount: expensesCount,
      spending: 0,
      expenses: 0,
      balance: 0
    });
  });

  return balances;
};
