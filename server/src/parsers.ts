import { Category, Expense } from "./types";

/*
/	Build array of Category objects
*/
export const parseCategories = (catInput: object[]) : Category[] => {
  
  const categories: Category[] = [];
  catInput.forEach( (catObj) => {

    const category: Category = {
      id: catObj["id" as keyof typeof catObj],
      name: catObj["name" as keyof typeof catObj],
      users: []
    };

    if (catObj["user_weight" as keyof typeof catObj] !== null) {
      const userWeightString: string[] = (catObj["user_weight" as keyof typeof catObj] as string).split(";");
      userWeightString.forEach( userWeight => {
        const userWeightProps = userWeight.split(",");
        category.users.push(
          {
            id: parseInt(userWeightProps[0]),
            name: userWeightProps[1],
            weight: parseInt(userWeightProps[2])
          }
        );
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
			payerId: expObj["payer_id" as keyof typeof expObj],
			payer: expObj["payer" as keyof typeof expObj],
		};

		expenses.push(expense);
	});

	return expenses;
};
