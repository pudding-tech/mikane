import { setDisplayNames } from "../utils/setDisplayNames";
import { Category, User } from "../types/types";
import { CategoryDB, UserNamesDB } from "../types/typesDB";
import { Target, CategoryIcon } from "../types/enums";

/**
 * Build array of Category objects. Format for either client or calculate function
 * @param catInput List of CategoryDB objects
 * @param target Choose if categories are meant for client presentation or calculations
 * @returns List of Category objects
 */
export const parseCategories = (catInput: CategoryDB[], target: Target, usersInEventInput?: UserNamesDB[]): Category[] => {
  const categories: Category[] = [];
  catInput.forEach(catObj => {

    // Validate and set icon
    let icon: CategoryIcon = catObj.icon as CategoryIcon;
    if (icon && !Object.values(CategoryIcon).includes(icon)) {
      icon = CategoryIcon.SHOPPING;
    }

    const category: Category = {
      id: catObj.id,
      name: catObj.name,
      icon: icon,
      weighted: catObj.weighted,
      created: catObj.created
    };

    if (target === Target.CLIENT) {
      category.users = [];
    }
    else if (target === Target.CALC) {
      category.userWeights = new Map<string, number>();
    }

    try {
      if (catObj.user_weights) {
        catObj.user_weights.forEach(weight => {
          if (target === Target.CLIENT && category.users) {
            category.users.push(
              {
                id: weight.user_id,
                name: weight.first_name,
                username: weight.username,
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

  let usersInEvent: User[] | undefined;
  if (usersInEventInput) {
    usersInEvent = [];
    usersInEventInput.forEach(userObj => {
      const user: User = {
        id: userObj.id,
        username: userObj.username,
        name: userObj.first_name,
        firstName: userObj.first_name,
        lastName: userObj.last_name
      };
      usersInEvent?.push(user);
    });
  }

  for (const category of categories) {
    if (category.users) {
      // Set unique names of users where they are shared
      setDisplayNames(category.users, usersInEvent);
      for (const user of category.users) {
        delete user.username;
        delete user.firstName;
        delete user.lastName;
      }
    }
  }

  return categories;
};
