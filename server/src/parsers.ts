import { setUserUniqueNames } from "./utils/setUserDisplayNames";
import { Category, Event, Expense, User, UserBalance, BalanceCalculationResult } from "./types/types";
import { Target } from "./types/enums";

/**
 * Build array of Category objects. Format for either client or calculate function
 * @param catInput List of objects
 * @param target Choose if categories are meant for client presentation or calculations
 * @returns List of Category objects
 */
export const parseCategories = (catInput: object[][], target: Target) : Category[] => {
  const categories: Category[] = [];
  const categoryList = catInput[0]; // List of categories
  const weightList = catInput[1]; // List of user weights
  categoryList.forEach(catObj => {

    const category: Category = {
      id: catObj["id" as keyof typeof catObj],
      name: catObj["name" as keyof typeof catObj],
      weighted: catObj["weighted" as keyof typeof catObj]
    };

    if (target === Target.CLIENT) {
      category.users = [];
    }
    else if (target === Target.CALC) {
      category.userWeights = new Map<number, number>();
    }

    weightList.forEach(weight => {
      if (weight["category_id" as keyof typeof weight] != catObj["id" as keyof typeof catObj]) {
        return;
      }
      if (target === Target.CLIENT && category.users) {
        category.users.push(
          {
            id: parseInt(weight["user_id" as keyof typeof weight]),
            name: weight["username" as keyof typeof weight],
            weight: parseInt(weight["weight" as keyof typeof weight])
          }
        );
      }
      else if (target === Target.CALC && category.userWeights) {
        category.userWeights.set(parseInt(weight["user_id" as keyof typeof weight]), parseInt(weight["weight" as keyof typeof weight]));
      }
    });

    categories.push(category);
  });

  return categories;
};

/**
 * Build array of Expense objects
 * @param expInput List of objects
 * @returns List of Expense objects
 */
export const parseExpenses = (expInput: object[]): Expense[] => {
  const expenses: Expense[] = [];
  expInput.forEach(expObj => {
    const expense: Expense = {
      id: expObj["id" as keyof typeof expObj],
      name: expObj["name" as keyof typeof expObj],
      description: expObj["description" as keyof typeof expObj],
      amount: expObj["amount" as keyof typeof expObj],
      categoryId: expObj["category_id" as keyof typeof expObj],
      categoryName: expObj["category_name" as keyof typeof expObj],
      dateAdded: expObj["date_added" as keyof typeof expObj],
      payer: {
        id: expObj["payer_id" as keyof typeof expObj],
        username: expObj["payer_username" as keyof typeof expObj],
        name: expObj["payer_first_name" as keyof typeof expObj],
        firstName: expObj["payer_first_name" as keyof typeof expObj],
        lastName: expObj["payer_last_name" as keyof typeof expObj],
        uuid: expObj["payer_uuid" as keyof typeof expObj]
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
 * @param usersInput List of objects
 * @param withEventData Whether to include user-event data (if present)
 * @returns List of User objects
 */
export const parseUsers = (usersInput: object[], withEventData: boolean): User[] => {
  const users: User[] = [];
  usersInput.forEach(userObj => {
    const user: User = {
      id: userObj["id" as keyof typeof userObj],
      username: userObj["username" as keyof typeof userObj],
      name: userObj["first_name" as keyof typeof userObj],
      firstName: userObj["first_name" as keyof typeof userObj],
      lastName: userObj["last_name" as keyof typeof userObj],
      email: userObj["email" as keyof typeof userObj],
      created: userObj["created" as keyof typeof userObj],
      uuid: userObj["uuid" as keyof typeof userObj],
      event: withEventData && userObj["event_id" as keyof typeof userObj] ? {
        id: userObj["event_id" as keyof typeof userObj],
        joinedDate: userObj["event_joined_date" as keyof typeof userObj]
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
 * @param userObj
 * @returns User object
 */
export const parseUser = (userObj: object): User => {
  return {
    id: userObj["id" as keyof typeof userObj],
    username: userObj["username" as keyof typeof userObj],
    name: userObj["first_name" as keyof typeof userObj],
    firstName: userObj["first_name" as keyof typeof userObj],
    lastName: userObj["last_name" as keyof typeof userObj],
    email: userObj["email" as keyof typeof userObj],
    phone: userObj["phone_number" as keyof typeof userObj],
    created: userObj["created" as keyof typeof userObj],
    uuid: userObj["uuid" as keyof typeof userObj]
  };
};

/**
 * Build array of Event objects
 * @param usersInput List of objects
 * @returns List of Event objects
 */
export const parseEvents = (eventsInput: object[]) => {
  const events: Event[] = [];
  for (const eventObj of eventsInput) {
    const event: Event = {
      id: eventObj["id" as keyof typeof eventObj],
      name: eventObj["name" as keyof typeof eventObj],
      description: eventObj["description" as keyof typeof eventObj],
      created: eventObj["created" as keyof typeof eventObj],
      adminId: eventObj["admin_id" as keyof typeof eventObj],
      private: eventObj["private" as keyof typeof eventObj],
      uuid: eventObj["uuid" as keyof typeof eventObj],
      user: eventObj["user_id" as keyof typeof eventObj] ? {
          id: eventObj["user_id" as keyof typeof eventObj],
          inEvent: eventObj["in_event" as keyof typeof eventObj],
          isAdmin: eventObj["is_admin" as keyof typeof eventObj]
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

  // Remove event information
  for (const balance of balances) {
    delete balance.user.event;
  }
  
  return balances;
};
