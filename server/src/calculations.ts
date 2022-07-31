import { Category, Expense, Payment, Debt, PaymentCalculationResult } from "./types";

export const calculatePayments = (expenses: Expense[], categories: Category[]) : PaymentCalculationResult | undefined => {
	const payments: Payment[] = [];
	const debts: Debt[] = [];
	const userNetExpense = new Map<number, number>;
	const categoryWeights = new Map<number, Map<number, number>>;

	categories.forEach( category => {
		const sumCategoryWeights = category.users.reduce((accumulator, obj) => {
			return accumulator + obj.weight;
		}, 0);
		const userWeights = new Map(category.users.map(obj => {
			return [obj.id, obj.weight /sumCategoryWeights];
		}));
		categoryWeights.set(category.id, userWeights);
	});

	expenses.forEach( expense => {
		const expenseCategory = categoryWeights.get(expense.categoryId);
		if (expenseCategory) {
			expenseCategory.forEach((userId: number, userWeight: number) => {
				const currentNetExpense = userNetExpense.get(userId) ? userNetExpense.get(userId) : 0.0;
				userNetExpense.set(userId, currentNetExpense + expense.amount * userWeight);
			});
		}
	});

	const lenders: Debt[] = [];
	const debtors: Debt[] = [];
	userNetExpense.forEach((userId: number, netExpense: number) => {
		if (netExpense > 0) {
			lenders.push({ userId: userId, amount: netExpense });
		} else if (netExpense < 0) {
			debtors.push({ userId: userId, amount: Math.abs(netExpense) });
		}
		debts.push({ userId: userId, amount: netExpense });
	});

	while (lenders.length > 0) {
		lenders.sort((a, b) => (a.amount > b.amount ? 1 : -1));
		debtors.sort((a, b) => (a.amount > b.amount ? 1 : -1));
		const largestLeander = lenders.pop();
		const largestDebtor = debtors.pop();

		if (!largestLeander || !largestDebtor)
			return;

		let paymentAmount = 0;
		if (largestLeander.amount > largestDebtor.amount) {
			paymentAmount = largestDebtor.amount;
			lenders.push({
				userId: largestLeander.userId,
				amount: largestLeander.amount - largestDebtor.amount,
			});
		}
		else if (largestLeander.amount < largestDebtor.amount) {
			paymentAmount = largestLeander.amount;
			debtors.push({
				userId: largestDebtor.userId,
				amount: largestDebtor.amount - largestLeander.amount,
			});
		}
		else {
			paymentAmount = largestDebtor.amount;
		}

		payments.push({
			senderId: largestDebtor.userId,
			receiverId: largestLeander.userId,
			amount: paymentAmount
		})
	}

	return {
		payments: payments,
		debts: debts
	}
};

/*
/	Build array of Category objects
*/
export const buildCategories = (catInput: object[]) : Category[] => {
  
  const categories: Category[] = [];
  catInput.forEach( (catObj) => {

    const category: Category = {
      id: catObj["id" as keyof typeof catObj],
      name: catObj["name" as keyof typeof catObj],
      users: []
    };

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
    categories.push(category);
  });

  console.log(categories);
  return categories;
};

/*
/	Build array of Expense objects
*/
export const buildExpenses = (expInput: object[]): Expense[] => {
	
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