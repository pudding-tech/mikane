import { Event, User, UserBalance, BalanceCalculationResult } from "../types/types";
import { EventDB, AdminIdDB } from "../types/typesDB";

/**
 * Build array of Event objects
 * @param usersInput List of EventDB objects
 * @returns List of Event objects
 */
export const parseEvents = (eventsInput: EventDB[]) => {
  const events: Event[] = [];
  for (const eventObj of eventsInput) {
    const adminIds: AdminIdDB[] = JSON.parse(eventObj.admin_ids) ?? [];

    const event: Event = {
      id: eventObj.id,
      name: eventObj.name,
      description: eventObj.description,
      created: eventObj.created,
      adminIds: adminIds.map(admin => admin.user_id),
      private: eventObj.private,
      uuid: eventObj.uuid,
      user: eventObj.user_id && eventObj.in_event !== undefined && eventObj.is_admin !== undefined ? {
          id: eventObj.user_id,
          inEvent: eventObj.in_event,
          isAdmin: eventObj.is_admin
        } : undefined
    };
    events.push(event);
  }

  return events;
};

/**
 * Parse BalanceCalculationResult into a list of UserBalance objects
 * @param users List of Users
 * @param balanceRes Balance Calculation Result
 */
export const parseBalance = (users: User[], balanceRes: BalanceCalculationResult) => {
  const balances: UserBalance[] = [];
  users.forEach(user => {
    for (let i = 0; i < balanceRes.balance.length; i++) {
      if (balanceRes.balance[i].user.id === user.id) {
        balances.push({
          user: user,
          spending: balanceRes.spending[i].amount,
          expenses: balanceRes.expenses[i].amount,
          balance: balanceRes.balance[i].amount
        });
        return;
      }
    }
    balances.push({
      user: user,
      spending: 0,
      expenses: 0,
      balance: 0
    });
  });

  // Sort users by date joined event
  balances.sort((a, b) => {
    if (!a.user.event?.joinedDate || !b.user.event?.joinedDate) {
      return 0;
    }
    return a.user.event?.joinedDate.getTime() - b.user.event?.joinedDate.getTime();
  });
  
  return balances;
};
