import {
	Category,
	Expense,
	Payment,
	Debt,
	PaymentCalculationResult,
} from "./types";

export const calculatePayments = (
	expenses: Expense[],
	categories: Category[]
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
		category.userWeights!.forEach((weight, userId) => {
			adjustedUserWeights.set(userId, weight / sumCategoryWeights);
		});
		categoryWeights.set(category.id, adjustedUserWeights);
	});

	expenses.forEach((expense) => {
		userNetExpense.set(
			expense.payerId,
			(userNetExpense.get(expense.payerId) ?? 0) + expense.amount
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
		if (netExpense > 0) {
			lenders.push({ userId: userId, amount: netExpense });
		} else if (netExpense < 0) {
			debtors.push({ userId: userId, amount: Math.abs(netExpense) });
		}
		debts.push({ userId: userId, amount: netExpense });
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
				userId: largestLeander.userId,
				amount: largestLeander.amount - largestDebtor.amount,
			});
		} else if (largestLeander.amount < largestDebtor.amount) {
			paymentAmount = largestLeander.amount;
			debtors.push({
				userId: largestDebtor.userId,
				amount: largestDebtor.amount - largestLeander.amount,
			});
		} else {
			paymentAmount = largestDebtor.amount;
		}

		payments.push({
			senderId: largestDebtor.userId,
			receiverId: largestLeander.userId,
			amount: paymentAmount,
		});
	}

	return {
		payments: payments,
		debts: debts,
	};
};
