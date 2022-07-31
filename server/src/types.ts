export type Category = {
  id: number,
  name: string,
  users: {
    id: number,
    name: string,
    weight: number
  }[]
}

export type Expense = {
  id: number,
  name: string,
  description: string,
  amount: number,
  categoryId: number,
  categoryName: string,
  payerId: number,
  payer: string
}

export type Payment = {
  senderId: number,
  receiverId: number,
  amount: number
}

export type Debt = {
  userId: number,
  amount: number
}

export type PaymentCalculationResult = {
  payments: Payment[],
  debts: Debt[]
}
