export const expenses = (
	participant: string,
	expenditures: number[],
	expenditureDistributions: number[],
	distributions: [[string], ...number[]]
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
	const loans = [];
	const debts = [];
	for (let i = 0; i < participants.length; i++) {
		const participant = participants[i];
		const netExpense = netExpenses[i][0];
		console.log(netExpense);
		if (netExpense > 0) {
			loans.push({ participant: participant, netExpense: netExpense });
		} else if (netExpense < 0) {
			debts.push({
				participant: participant,
				netExpense: Math.abs(netExpense),
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
