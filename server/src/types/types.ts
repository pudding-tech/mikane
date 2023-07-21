import { CategoryIcon } from "./enums";

export type User = {
  id: string;
  name: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  created?: Date;
  avatarURL?: string;
  eventInfo?: {
    id: string;
    isAdmin: boolean;
    joinedTime: Date;
  };
};

export type Event = {
  id: string;
  name: string;
  description: string;
  created: Date;
  adminIds: string[];
  private: boolean;
  userInfo?: {
    id: string;
    inEvent: boolean;
    isAdmin: boolean;
  };
};

export type Category = {
  id: string;
  name: string;
  icon: CategoryIcon;
  weighted: boolean;
  created: Date;
  userWeights?: Map<string, number>;
  users?: {
    id: string;
    name: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    weight?: number;
  }[];
};

export type Expense = {
  id: string;
  name: string;
  description: string;
  amount: number;
  created: number;
  categoryInfo: {
    id: string;
    name: string;
    icon: CategoryIcon;
  };
  payer: User;
};

export type Payment = {
  sender: User;
  receiver: User;
  amount: number;
};

export type Record = {
  user: User;
  amount: number;
};

export type BalanceCalculationResult = {
  balance: Record[];
  spending: Record[];
  expenses: Record[];
};

export type UserBalance = {
  user: User;
  expensesCount: number;
  spending: number;
  expenses: number;
  balance: number;
};

export type APIKey = {
  apiKeyId: string;
  name: string;
  hashedKey: string;
  master: boolean;
  validFrom?: Date;
  validTo?: Date;
};

export type DBConfig = {
  host: string,
  port: number,
  database: string,
  user: string,
  password: string
};
