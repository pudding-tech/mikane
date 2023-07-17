import { setUserUniqueNames } from "../utils/setUserDisplayNames";
import { Category } from "../types/types";
import { CategoryDB } from "../types/typesDB";
import { Target, CategoryIcon } from "../types/enums";

/**
 * Build array of Category objects. Format for either client or calculate function
 * @param catInput List of CategoryDB objects
 * @param target Choose if categories are meant for client presentation or calculations
 * @returns List of Category objects
 */
export const parseCategories = (catInput: CategoryDB[], target: Target): Category[] => {
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
