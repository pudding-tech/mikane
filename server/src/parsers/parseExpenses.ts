import { setDisplayNames } from "../utils/setDisplayNames";
import { Expense, User } from "../types/types";
import { ExpenseDB, UserNamesDB } from "../types/typesDB";
import { CategoryIcon } from "../types/enums";
import { getGravatarURL } from "../utils/gravatar";

/**
 * Build array of Expense objects
 * @param expInput List of ExpenseDB objects
 * @param usersInEventInput List of all users in event
 * @returns List of Expense objects
 */
export const parseExpenses = (expInput: ExpenseDB[], usersInEventInput?: UserNamesDB[]): Expense[] => {
  const expenses: Expense[] = [];
  expInput.forEach((expObj) => {
    // Validate and set category icon
    let icon: CategoryIcon = expObj.category_icon as CategoryIcon;
    if (icon && !Object.values(CategoryIcon).includes(icon)) {
      icon = CategoryIcon.SHOPPING;
    }

    const expense: Expense = {
      id: expObj.id,
      name: expObj.name,
      description: expObj.description,
      amount: parseFloat(expObj.amount),
      created: expObj.created.getTime(),
      categoryInfo: {
        id: expObj.category_id,
        name: expObj.category_name,
        icon: icon,
      },
      payer: expObj.payer_deleted ? {
        id: expObj.payer_id,
        username: "Deleted user",
        name: "Deleted user",
        avatarURL: getGravatarURL("", { size: 50, default: "mp" }),
        guest: expObj.payer_guest
      } : {
        id: expObj.payer_id,
        username: expObj.payer_username,
        name: expObj.payer_first_name,
        firstName: expObj.payer_first_name,
        lastName: expObj.payer_last_name,
        avatarURL: getGravatarURL(expObj.payer_email ?? "", { size: 50, default: expObj.payer_guest ? "mp" : "identicon" }),
        guest: expObj.payer_guest
      },
    };
    expenses.push(expense);
  });

  let usersInEvent: User[] | undefined;
  if (usersInEventInput) {
    usersInEvent = [];
    usersInEventInput.forEach(userObj => {
      const user: User = {
        id: userObj.id,
        username: userObj.username,
        name: userObj.first_name,
        firstName: userObj.first_name,
        lastName: userObj.last_name,
        guest: userObj.guest
      };
      usersInEvent?.push(user);
    });
  }

  // Set unique names of users where they are shared
  const users: User[] = expenses.map((expense) => expense.payer);
  setDisplayNames(users, usersInEvent);
  for (const user of users) {
    delete user.firstName;
    delete user.lastName;
  }

  return expenses;
};
