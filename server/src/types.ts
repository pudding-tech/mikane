export type User = {
  id: number,
  name: string
}

export type Category = {
  id: number,
  name: string,
  weighted: boolean,
  userWeights?: Map<number, number>,
  users?: {
    id: number,
    name: string,
    weight?: number
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

export type Record = {
  user: User,
  amount: number
}

export type BalanceCalculationResult = {
  balance: Record[],
  spending: Record[],
  expenses: Record[]
}

export type UserBalance = {
  userId: number,
  spending: number,
  expenses: number,
  balance: number
}
