export type UserDB = {
  id: string,
  username: string,
  first_name: string,
  last_name: string,
  email: string,
  phone_number: string,
  created: Date,
  event_uuid?: string,
  event_admin?: boolean,
  event_joined_time?: Date
};

export type EventDB = {
  id: string,
  name: string,
  description: string,
  created: Date,
  admin_ids: {
    user_id: string
  }[],
  private: boolean,
  user_id?: string,
  user_in_event?: boolean,
  user_is_admin?: boolean
};

export type CategoryDB = {
  id: string,
  name: string,
  icon: string,
  weighted: boolean,
  created: Date,
  user_weights: {
    user_id: string,
    first_name: string,
    last_name: string,
    weight: number
  }[]
};

export type ExpenseDB = {
  uuid: string,
  name: string,
  description: string,
  amount: number,
  category_id: string,
  category_name: string,
  category_icon: string;
  created: Date,
  payer_id: string,
  payer_username: string,
  payer_first_name: string,
  payer_last_name: string
};

export type APIKeyDB = {
  id: string,
  name: string,
  hashed_key: string,
  master: boolean,
  valid_from: Date,
  valid_to: Date
};
