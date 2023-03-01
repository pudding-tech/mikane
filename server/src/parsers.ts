import { setUserUniqueNames } from "./utils/setUserDisplayNames";
import { Category, Event, Expense, User, UserBalance, BalanceCalculationResult } from "./types/types";
import { CategoryTarget } from "./types/enums";

/**
 * Build array of Category objects. Format for either client or calculate function
 * @param catInput List of objects
 * @param target Choose if categories are meant for client presentation or calculations
 * @returns List of Category objects
 */
export const parseCategories = (catInput: object[], target: CategoryTarget) : Category[] => {
  const categories: Category[] = [];
  catInput.forEach(catObj => {

    const category: Category = {
      id: catObj["id" as keyof typeof catObj],
      name: catObj["name" as keyof typeof catObj],
      weighted: catObj["weighted" as keyof typeof catObj]
    };

    if (target === CategoryTarget.CLIENT) {
      category.users = [];
    }
    else if (target === CategoryTarget.CALC) {
      category.userWeights = new Map<number, number>();
    }

    if (catObj["user_weight" as keyof typeof catObj] !== null) {
      const userWeightString: string[] = (catObj["user_weight" as keyof typeof catObj] as string).split(";");
      userWeightString.forEach(userWeight => {
        const userWeightProps = userWeight.split(",");
        if (target === CategoryTarget.CLIENT && category.users) {
          category.users.push(
            {
              id: parseInt(userWeightProps[0]),
              name: userWeightProps[1],
              weight: parseInt(userWeightProps[2])
            }
          );
        }
        else if (target === CategoryTarget.CALC && category.userWeights) {
          category.userWeights.set(parseInt(userWeightProps[0]), parseInt(userWeightProps[2]));
        }
      });
    }

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
      time: expObj["date_added" as keyof typeof expObj],
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
 * @returns List of User objects
 */
export const parseUsers = (usersInput: object[]): User[] => {
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
      uuid: userObj["uuid" as keyof typeof userObj]
		};
		users.push(user);
	});

  // Set unique names of users where they are shared
  setUserUniqueNames(users);
  for (const user of users) {
    delete user.firstName;
    delete user.lastName;
  }

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
      created: eventObj["created" as keyof typeof eventObj],
      adminId: eventObj["admin_id" as keyof typeof eventObj],
      private: eventObj["private" as keyof typeof eventObj],
      uuid: eventObj["uuid" as keyof typeof eventObj]
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

  // balances.sort((a, b) => {
  //   if (!a.user.eventJoined || !b.user.eventJoined) {
  //     return 0;
  //   }
  //   return a.user.eventJoined.getTime() - b.user.eventJoined.getTime();
  // });
  
  return balances;
};
