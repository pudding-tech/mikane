import { setUserUniqueNames } from "../utils/setUserDisplayNames";
import { Expense, User } from "../types/types";
import { ExpenseDB } from "../types/typesDB";
import { CategoryIcon } from "../types/enums";

/**
 * Build array of Expense objects
 * @param expInput List of ExpenseDB objects
 * @returns List of Expense objects
 */
export const parseExpenses = (expInput: ExpenseDB[]): Expense[] => {
  const expenses: Expense[] = [];
  expInput.forEach((expObj) => {
    // Validate and set category icon
    let icon: CategoryIcon = expObj.category_icon as CategoryIcon;
    if (icon && !Object.values(CategoryIcon).includes(icon)) {
      icon = CategoryIcon.SHOPPING;
    }

    const expense: Expense = {
      id: expObj.uuid,
      name: expObj.name,
      description: expObj.description,
      amount: expObj.amount,
      created: expObj.created.getTime(),
      categoryInfo: {
        id: expObj.category_id,
        name: expObj.category_name,
        icon: icon,
      },
      payer: {
        id: expObj.payer_id,
        username: expObj.payer_username,
        name: expObj.payer_first_name,
        firstName: expObj.payer_first_name,
        lastName: expObj.payer_last_name,
      },
    };
    expenses.push(expense);
  });

  // Set unique names of users where they are shared
  const users: User[] = expenses.map((expense) => expense.payer);
  setUserUniqueNames(users);
  for (const user of users) {
    delete user.firstName;
    delete user.lastName;
  }

  return expenses;
};
