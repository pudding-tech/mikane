export type User = {
  id: number,
  username: string,
  name: string,
  firstName?: string,
  lastName?: string,
  email?: string,
  phone?: string,
  created?: Date,
  uuid: string,
  event?: {
    id: number,
    joinedDate: Date
  }
}

export type Event = {
  id: number,
  name: string,
  description: string,
  created: Date,
  adminId: number,
  private: boolean,
  uuid: string,
  user?: {
    id: number,
    inEvent: boolean,
    isAdmin: boolean
  }
};

export type Category = {
  id: number,
  name: string,
  weighted: boolean,
  userWeights?: Map<number, number>,
  users?: {
    id: number,
    name: string,
    firstName?: string,
    lastName?: string,
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
  dateAdded: Date,
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

export type APIKey = {
  apiKeyId: string,
  name: string,
  hashedKey: string,
  master: boolean,
  validFrom?: Date,
  validTo?: Date
}
