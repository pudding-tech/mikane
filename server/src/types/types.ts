export type User = {
  id: number,
  username: string,
  email?: string,
  created?: Date,
  eventJoined?: Date,
  uuid?: string
}

export type Event = {
  id: number,
  name: string,
  created: Date,
  adminId: number,
  private: boolean,
  uuid: string
};

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
  user: User,
  spending: number,
  expenses: number,
  balance: number
}
