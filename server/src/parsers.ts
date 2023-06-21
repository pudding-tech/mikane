import { setUserUniqueNames } from "./utils/setUserDisplayNames";
import { Category, Event, Expense, User, UserBalance, BalanceCalculationResult, APIKey } from "./types/types";
import { CategoryDB, UserWeightDB, ExpenseDB, UserDB, EventDB, APIKeyDB, AdminIdDB } from "./types/typesDB";
import { Target } from "./types/enums";

/**
 * Build array of Category objects. Format for either client or calculate function
 * @param catInput List of CategoryDB objects
 * @param target Choose if categories are meant for client presentation or calculations
 * @returns List of Category objects
 */
export const parseCategories = (catInput: CategoryDB[], target: Target) : Category[] => {
  const categories: Category[] = [];
  catInput.forEach(catObj => {

    const category: Category = {
      id: catObj.id,
      name: catObj.name,
      weighted: catObj.weighted
    };

    if (target === Target.CLIENT) {
      category.users = [];
    }
    else if (target === Target.CALC) {
      category.userWeights = new Map<number, number>();
    }

    try {
      const userWeights: UserWeightDB[] = JSON.parse(catObj.user_weights);

      if (userWeights) {
        userWeights.forEach(weight => {
          if (target === Target.CLIENT && category.users) {
            category.users.push(
              {
                id: weight.user_id,
                name: weight.first_name,
                firstName: weight.first_name,
                lastName: weight.last_name,
                weight: weight.weight
              }
            );
          }
          else if (target === Target.CALC && category.userWeights) {
            category.userWeights.set(weight.user_id, weight.weight);
          }
        });
      }
    }
    catch (err) {
      console.error(err);
    }

    categories.push(category);
  });

  for (const category of categories) {
    if (category.users) {
      // Set unique names of users where they are shared
      setUserUniqueNames(category.users);
      for (const user of category.users) {
        delete user.firstName;
        delete user.lastName;
      }
    }
  }

  return categories;
};

/**
 * Build array of Expense objects
 * @param expInput List of ExpenseDB objects
 * @returns List of Expense objects
 */
export const parseExpenses = (expInput: ExpenseDB[]): Expense[] => {
  const expenses: Expense[] = [];
  expInput.forEach(expObj => {
    const expense: Expense = {
      id: expObj.id,
      name: expObj.name,
      description: expObj.description,
      amount: expObj.amount,
      categoryId: expObj.category_id,
      categoryName: expObj.category_name,
      dateAdded: expObj.date_added,
      payer: {
        id: expObj.payer_id,
        username: expObj.payer_username,
        name: expObj.payer_first_name,
        firstName: expObj.payer_first_name,
        lastName: expObj.payer_last_name,
        uuid: expObj.payer_uuid
      }
		};
		expenses.push(expense);
	});

  // Set unique names of users where they are shared
  const users: User[] = expenses.map(expense => expense.payer);
  setUserUniqueNames(users);
  for (const user of users) {
    delete user.firstName;
    delete user.lastName;
  }

	return expenses;
};

/**
 * Build array of User objects
 * @param usersInput List of UserDB objects
 * @param withEventData Whether to include user-event data (if present)
 * @returns List of User objects
 */
export const parseUsers = (usersInput: UserDB[], withEventData: boolean): User[] => {
  const users: User[] = [];
  usersInput.forEach(userObj => {
    const user: User = {
      id: userObj.id,
      username: userObj.username,
      name: userObj.first_name,
      firstName: userObj.first_name,
      lastName: userObj.last_name,
      email: userObj.email,
      created: userObj.created,
      uuid: userObj.uuid,
      event: withEventData && userObj.event_id && userObj.event_joined_date ? {
        id: userObj.event_id,
        isAdmin: userObj.event_admin ?? false,
        joinedDate: userObj.event_joined_date
      } : undefined
    };
    users.push(user);
  });

  // Set unique names of users where they are shared
  setUserUniqueNames(users);
  for (const user of users) {
    delete user.firstName;
    delete user.lastName;
  }

  // Sort users by date joined event
  users.sort((a, b) => {
    if (!a.event?.joinedDate || !b.event?.joinedDate) {
      return 0;
    }
    return a.event?.joinedDate.getTime() - b.event?.joinedDate.getTime();
  });

  return users;
};

/**
 * Parse single User object
 * @param userObj UserDB object
 * @returns User object
 */
export const parseUser = (userObj: UserDB): User => {
  return {
    id: userObj.id,
    username: userObj.username,
    name: userObj.first_name,
    firstName: userObj.first_name,
    lastName: userObj.last_name,
    email: userObj.email,
    phone: userObj.phone_number,
    created: userObj.created,
    uuid: userObj.uuid
  };
};

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

/**
 * Build array of API keys 
 * @param keysInput 
 * @returns List of API keys
 */
export const parseApiKeys = (keysInput: APIKeyDB[]) => {
  const keys: APIKey[] = [];
  for (const key of keysInput) {
    keys.push({
      apiKeyId: key.api_key_id,
      name: key.name,
      hashedKey: key.hashed_key,
      master: key.master,
      validFrom: key.valid_from ? key.valid_from : undefined,
      validTo: key.valid_to ? key.valid_to : undefined
    });
  }
  return keys;
};
