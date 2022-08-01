import { Category, Expense, User } from "./types";

/*
/	Build array of Category objects. Format for either client or calculate function
*/
export const parseCategories = (catInput: object[], target: string) : Category[] => {
  
  const categories: Category[] = [];
  catInput.forEach( (catObj) => {

    const category: Category = {
      id: catObj["id" as keyof typeof catObj],
      name: catObj["name" as keyof typeof catObj],
    };

    if (target === "client") {
      category.users = [];
    }
    else if (target === "calc") {
      category.userWeights = new Map<User, number>();
    }

    if (catObj["user_weight" as keyof typeof catObj] !== null) {
      const userWeightString: string[] = (catObj["user_weight" as keyof typeof catObj] as string).split(";");
      userWeightString.forEach( userWeight => {
        const userWeightProps = userWeight.split(",");
        if (target === "client" && category.users) {
          category.users.push(
            {
              id: parseInt(userWeightProps[0]),
              name: userWeightProps[1],
              weight: parseInt(userWeightProps[2])
            }
          );
        }
        else if (target === "calc" && category.userWeights) {
          const user: User = {
            id: parseInt(userWeightProps[0]),
            name: userWeightProps[1]
          };
          category.userWeights.set(user, parseInt(userWeightProps[2]));
        }
      });
    }

    categories.push(category);
  });

  return categories;
};

/*
/	Build array of Expense objects
*/
export const parseExpenses = (expInput: object[]): Expense[] => {

	const expenses: Expense[] = [];
	expInput.forEach( (expObj) => {
		const expense: Expense = {
			id: expObj["id" as keyof typeof expObj],
			name: expObj["name" as keyof typeof expObj],
			description: expObj["description" as keyof typeof expObj],
			amount: expObj["amount" as keyof typeof expObj],
			categoryId: expObj["category_id" as keyof typeof expObj],
			categoryName: expObj["category_name" as keyof typeof expObj],
      payer: {
        id: expObj["payer_id" as keyof typeof expObj],
        name: expObj["payer" as keyof typeof expObj]
      }
		};

		expenses.push(expense);
	});

	return expenses;
};
