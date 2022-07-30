function EXPENSES(participant, expenditures, expenditureDistributions, distributions) {
    var sum = 0;
    for (var i = 0; i < expenditures.length; i++) {
      var expenditure = expenditures[i];
      if (expenditure != 0) {
        var distributionKey = expenditureDistributions[i];
        var participantShare = 0;
        var distributionSum = 1;
        for (var j = 1; j < distributions[0].length; j++) {
          var distributionParticipant = distributions[0][j];
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
  
  function PAYMENTS(participants = ["Alice","Bob","Charlie"], netExpenses = [[-6.67],[1.67],[5]]) {
    var loans = [];
    var debts = [];
    for (var i = 0; i < participants.length; i++) {
      var participant = participants[i];
      var netExpense = netExpenses[i][0];
      console.log(netExpense);
      if (netExpense > 0) {
        loans.push({"participant": participant, "netExpense": netExpense});
      }
      else if (netExpense < 0) {
        debts.push({"participant": participant, "netExpense": Math.abs(netExpense)});
      }
    }
  
    var payments = new Array(participants.length).fill("").map(() => new Array(participants.length).fill(""));
  
    while (loans.length > 0) {
      loans.sort((a, b) => (a.netExpense > b.netExpense) ? 1 : -1);
      debts.sort((a, b) => (a.netExpense > b.netExpense) ? 1 : -1);
      var largestLoan = loans.pop();
      var largestDebt = debts.pop();
  
      var paymentAmount = 0;
      if (largestLoan.netExpense > largestDebt.netExpense) {
        paymentAmount = largestDebt.netExpense;
        loans.push({"participant": largestLoan.participant, "netExpense": largestLoan.netExpense - largestDebt.netExpense});
      }
      else if (largestLoan.netExpense < largestDebt.netExpense) {
        paymentAmount = largestLoan.netExpense;
        debts.push({"participant": largestDebt.participant, "netExpense": largestDebt.netExpense - largestLoan.netExpense});
      }
      else {
        paymentAmount = largestDebt.netExpense;
      }
  
      payments[participants.indexOf(largestDebt.participant)][participants.indexOf(largestLoan.participant)] = paymentAmount;
  
    }
    return payments;
  };
  