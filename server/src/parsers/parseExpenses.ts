import { setUserUniqueNames } from "../utils/setUserDisplayNames";
import { Expense, User } from "../types/types";
import { ExpenseDB } from "../types/typesDB";

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
