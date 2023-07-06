export type UserDB = {
  uuid: string,
  username: string,
  first_name: string,
  last_name: string,
  email: string,
  phone_number: string,
  created: Date,
  event_uuid?: string,
  event_admin?: boolean,
  event_joined_date?: Date
}

export type EventDB = {
  uuid: string,
  name: string,
  description: string,
  created: Date,
  admin_ids: string,
  private: boolean,
  user_uuid?: string,
  user_in_event?: boolean,
  user_is_admin?: boolean
}

export type CategoryDB = {
  uuid: string,
  name: string,
  icon: string,
  weighted: boolean,
  user_weights: string
}

export type UserWeightDB = {
  user_uuid: string,
  first_name: string,
  last_name: string,
  weight: number
}

export type ExpenseDB = {
  uuid: string,
  name: string,
  description: string,
  amount: number,
  category_id: number,
  category_uuid: string,
  category_name: string,
  category_icon: string;
  date_added: Date,
  payer_uuid: string,
  payer_username: string,
  payer_first_name: string,
  payer_last_name: string
}

export type AdminIdDB = {
  user_uuid: string
}

export type APIKeyDB = {
  api_key_id: string,
  name: string,
  hashed_key: string,
  master: boolean,
  valid_from: Date,
  valid_to: Date
}
