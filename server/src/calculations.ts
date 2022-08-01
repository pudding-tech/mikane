import {
	User,
	Category,
	Expense,
	Payment,
	Record,
	PaymentCalculationResult,
} from "./types";

export const calculatePayments = (
	expenses: Expense[],
	categories: Category[],
	users: User[]
): PaymentCalculationResult => {
	const payments: Payment[] = [];
	const balance: Record[] = [];
	const spending: Record[] = [];
	const expensesOutput: Record[] = [];
	const categoryWeights = new Map<number, Map<number, number>>();
	const userNetExpense = new Map<number, number>();

	categories.forEach((category) => {
		if (!category.userWeights) {
			return console.log("Category object formatted wrong!");
		}
		let sumCategoryWeights = 0;
		category.userWeights.forEach((weight) => {
			sumCategoryWeights += weight;
		});
		const adjustedUserWeights = new Map<number, number>();
		category.userWeights.forEach((weight, user) => {
			adjustedUserWeights.set(user, weight / sumCategoryWeights);
		});
		categoryWeights.set(category.id, adjustedUserWeights);
	});

	const spendingMap = new Map<number, number>();
	const expensesOutputMap = new Map<number, number>();
	expenses.forEach((expense) => {
		expensesOutputMap.set(
			expense.payer.id,
			(expensesOutputMap.get(expense.payer.id) ?? 0) + expense.amount
		);
		userNetExpense.set(
			expense.payer.id,
			(userNetExpense.get(expense.payer.id) ?? 0) + expense.amount
		);
		const expenseCategory = categoryWeights.get(expense.categoryId);
		if (expenseCategory) {
			expenseCategory.forEach((userWeight: number, userId: number) => {
				spendingMap.set(
					userId,
					(spendingMap.get(userId) ?? 0) - (expense.amount * userWeight)
				);
				userNetExpense.set(
					userId,
					(userNetExpense.get(userId) ?? 0) - (expense.amount * userWeight)
				);
			});
		}
	});

	const lenders: Record[] = [];
	const debtors: Record[] = [];
	userNetExpense.forEach((netExpense: number, userId: number) => {
		const user = users.find((user) => {
			return user.id == userId;
		});
		if (user !== undefined) {
			if (netExpense > 0) {
				lenders.push({ user: user, amount: netExpense });
			} else if (netExpense < 0) {
				debtors.push({ user: user, amount: Math.abs(netExpense) });
			}
			spending.push({ user: user, amount: spendingMap.get(userId) ?? 0 });
			expensesOutput.push({ user: user, amount: expensesOutputMap.get(userId) ?? 0 });
			balance.push({ user: user, amount: netExpense });
		}
	});

	while (lenders.length > 0 && debtors.length > 0) {
		lenders.sort((a, b) => (a.amount > b.amount ? 1 : -1));
		debtors.sort((a, b) => (a.amount > b.amount ? 1 : -1));
		const largestLeander = lenders.pop();
		const largestDebtor = debtors.pop();

		if (!largestLeander || !largestDebtor) {
			break;
		}

		let paymentAmount = 0;
		if (largestLeander.amount > largestDebtor.amount) {
			paymentAmount = largestDebtor.amount;
			lenders.push({
				user: largestLeander.user,
				amount: largestLeander.amount - largestDebtor.amount,
			});
		} else if (largestLeander.amount < largestDebtor.amount) {
			paymentAmount = largestLeander.amount;
			debtors.push({
				user: largestDebtor.user,
				amount: largestDebtor.amount - largestLeander.amount,
			});
		} else {
			paymentAmount = largestDebtor.amount;
		}

		payments.push({
			sender: largestDebtor.user,
			receiver: largestLeander.user,
			amount: paymentAmount,
		});
	}

	return {
		payments: payments,
		balance: balance,
		spending: spending,
		expenses: expensesOutput
	};
};
