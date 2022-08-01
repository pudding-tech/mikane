import {
	User,
	Category,
	Expense,
	Payment,
	Debt,
	PaymentCalculationResult,
} from "./types";

export const calculatePayments = (
	expenses: Expense[],
	categories: Category[],
	users: User[]
): PaymentCalculationResult => {
	const payments: Payment[] = [];
	const debts: Debt[] = [];
	const categoryWeights = new Map<number, Map<number, number>>();
	const userNetExpense = new Map<number, number>();

	categories.forEach((category) => {
		let sumCategoryWeights = 0;
		category.userWeights!.forEach((weight) => {
			sumCategoryWeights += weight;
		});
		const adjustedUserWeights = new Map<number, number>();
		category.userWeights!.forEach((weight, user) => {
			adjustedUserWeights.set(user, weight / sumCategoryWeights);
		});
		categoryWeights.set(category.id, adjustedUserWeights);
	});

	expenses.forEach((expense) => {
		userNetExpense.set(
			expense.payer.id,
			(userNetExpense.get(expense.payer.id) ?? 0) + expense.amount
		);
		const expenseCategory = categoryWeights.get(expense.categoryId);
		if (expenseCategory) {
			expenseCategory.forEach((userWeight: number, userId: number) => {
				userNetExpense.set(
					userId,
					(userNetExpense.get(userId) ?? 0) - (expense.amount * userWeight)
				);
			});
		}
	});

	const lenders: Debt[] = [];
	const debtors: Debt[] = [];
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
			debts.push({ user: user, amount: netExpense });
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
		debts: debts,
	};
};
