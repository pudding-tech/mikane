create table "user" (
  id serial primary key,
  username varchar(255) not null unique,
  first_name varchar(255) not null,
  last_name varchar(255),
  email varchar(255) not null unique,
  phone_number varchar(20) not null unique,
  "password" varchar(255) not null,
  created timestamp not null,
  "uuid" uuid default gen_random_uuid() not null unique
);

create table "event" (
  id serial primary key,
  "name" varchar(255) not null unique,
  "description" varchar(400),
  created timestamp not null,
  "private" boolean not null,
  active boolean not null default true,
  usernames_only boolean not null,
  "uuid" uuid default gen_random_uuid() not null unique
);

create table user_event (
  user_id int references "user"(id) on delete cascade,
  event_id int references "event"(id) on delete cascade,
  joined_date timestamp not null,
  "admin" boolean not null,
  primary key (user_id, event_id)
);

create table category (
  id serial primary key,
  "name" varchar(255) not null,
  icon varchar(255),
  weighted boolean not null,
  event_id int references "event"(id) on delete cascade,
  "uuid" uuid default gen_random_uuid() not null unique
);

create table expense (
  id serial primary key,
  "name" varchar(255) not null,
  "description" varchar(255),
  amount numeric(16, 2) not null,
  category_id int references category(id) on delete cascade,
  payer_id int references "user"(id) on delete cascade,
  date_added timestamp not null,
  "uuid" uuid default gen_random_uuid() not null unique
);

create table user_category (
  user_id int references "user"(id) on delete cascade,
  category_id int references category(id) on delete cascade,
  "weight" numeric(14),
  primary key (user_id, category_id)
);

create table "session" (
  "sid" varchar(255) not null primary key,
  "session" text not null,
  expires timestamp not null,
  user_id int references "user"(id) on delete cascade,
  user_uuid uuid not null
);

create table api_key (
  api_key_id uuid primary key default gen_random_uuid(),
  "name" varchar(255) not null unique,
  hashed_key varchar(255) not null,
  "master" boolean not null,
  valid_from timestamp,
  valid_to timestamp
);

create table register_account_key (
  "key" varchar(255) primary key,
  email varchar(255) not null,
  used boolean not null,
  expires timestamp not null
);

create table delete_account_key (
  "key" varchar(255) primary key,
  user_id int references "user"(id) on delete set null,
  used boolean not null,
  expires timestamp not null
);

create table password_reset_key (
  "key" varchar(255) primary key,
  user_id int references "user"(id) on delete cascade,
  used boolean not null,
  expires timestamp not null
);
