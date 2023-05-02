export type CategoryDB = {
  id: number,
  name: string,
  weighted: boolean,
  user_weights: string
}

export type UserWeightDB = {
  user_id: number,
  first_name: string,
  last_name: string,
  weight: number
}

export type ExpenseDB = {
  id: number,
  name: string,
  description: string,
  amount: number,
  category_id: number,
  category_name: string,
  date_added: Date,
  payer_id: number,
  payer_username: string,
  payer_first_name: string,
  payer_last_name: string,
  payer_uuid: string
}

export type UserDB = {
  id: number,
  username: string,
  first_name: string,
  last_name: string,
  email: string,
  phone_number: string,
  created: Date,
  uuid: string,
  event_id?: number,
  event_joined_date?: Date
}

export type EventDB = {
  id: number,
  name: string,
  description: string,
  created: Date,
  admin_id: number,
  private: boolean,
  uuid: string,
  user_id?: number,
  in_event?: boolean,
  is_admin?: boolean
}

export type APIKeyDB = {
  api_key_id: string,
  name: string,
  hashed_key: string,
  master: boolean,
  valid_from: Date,
  valid_to: Date
}
