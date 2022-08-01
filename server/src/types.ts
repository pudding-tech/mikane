export type User = {
  id: number,
  name: string
}

export type Category = {
  id: number,
  name: string,
  userWeights?: Map<number, number>,
  users?: {
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
  payer: User
}

export type Payment = {
  sender: User,
  receiver: User,
  amount: number
}

export type Debt = {
  user: User,
  amount: number
}

export type PaymentCalculationResult = {
  payments: Payment[],
  debts: Debt[]
}
