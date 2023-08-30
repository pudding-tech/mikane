export type UserDB = {
  id: string,
  username: string,
  first_name: string,
  last_name: string,
  email: string,
  phone_number: string,
  created: Date,
  guest: boolean,
  deleted: boolean,
  event_id?: string,
  is_event_admin?: boolean,
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
  active: boolean,
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
    guest: boolean,
    username: string;
    first_name: string,
    last_name: string,
    email: string,
    weight: number,
    deleted: boolean
  }[]
};

export type ExpenseDB = {
  id: string,
  name: string,
  description: string,
  amount: string,
  category_id: string,
  category_name: string,
  category_icon: string;
  created: Date,
  payer_id: string,
  payer_first_name: string,
  payer_last_name: string,
  payer_username: string,
  payer_email: string,
  payer_guest: boolean,
  payer_deleted: boolean
};

export type APIKeyDB = {
  id: string,
  name: string,
  hashed_key: string,
  master: boolean,
  valid_from: Date,
  valid_to: Date
};

export type UserNamesDB = {
  id: string,
  username: string,
  first_name: string,
  last_name: string,
  guest: boolean
};
