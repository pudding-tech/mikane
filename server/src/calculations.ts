import { Category, Expense } from "./types";

export const expenses = (
	participant: string,
	expenditures: number[],
	expenditureDistributions: number[],
	distributions: [[string], ...number[]] | any
) => {
	let sum = 0;
	for (let i = 0; i < expenditures.length; i++) {
		const expenditure = expenditures[i];
		if (expenditure != 0) {
			const distributionKey = expenditureDistributions[i];
			let participantShare = 0;
			let distributionSum = 1;
			for (let j = 1; j < distributions[0].length; j++) {
				const distributionParticipant = distributions[0][j];
				if (distributionParticipant == participant) {
					participantShare = distributions[distributionKey][j];
					distributionSum = distributions[distributionKey][0];
					break;
				}
			}
			sum += expenditure * (participantShare / distributionSum);
		}
	}
	return sum;
};

export const payments = (
	participants: [string],
	netExpenses: [...[number][]]
) => {
	const loans: {participant: string, netExpense: number}[] = [];
	const debts: {participant: string, netExpense: number}[] = [];
	for (let i = 0; i < participants.length; i++) {
		const participant = participants[i];
		const netExpense = netExpenses[i][0];
		console.log(netExpense);
		if (netExpense > 0) {
			loans.push({ participant: participant, netExpense: netExpense });
		} else if (netExpense < 0) {
			debts.push({
				participant: participant,
				netExpense: Math.abs(netExpense)
			});
		}
	}

	const payments = new Array(participants.length)
		.fill("")
		.map(() => new Array(participants.length).fill(""));

	while (loans.length > 0) {
		loans.sort((a, b) => (a.netExpense > b.netExpense ? 1 : -1));
		debts.sort((a, b) => (a.netExpense > b.netExpense ? 1 : -1));
		const largestLoan = loans.pop();
		const largestDebt = debts.pop();

		if (!largestLoan || !largestDebt)
			return;

		let paymentAmount = 0;
		if (largestLoan.netExpense > largestDebt.netExpense) {
			paymentAmount = largestDebt.netExpense;
			loans.push({
				participant: largestLoan.participant,
				netExpense: largestLoan.netExpense - largestDebt.netExpense,
			});
		} else if (largestLoan.netExpense < largestDebt.netExpense) {
			paymentAmount = largestLoan.netExpense;
			debts.push({
				participant: largestDebt.participant,
				netExpense: largestDebt.netExpense - largestLoan.netExpense,
			});
		} else {
			paymentAmount = largestDebt.netExpense;
		}

		payments[participants.indexOf(largestDebt.participant)][
			participants.indexOf(largestLoan.participant)
		] = paymentAmount;
	}
	return payments;
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