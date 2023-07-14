create table "user" (
  id uuid primary key default gen_random_uuid(),
  username varchar(255) not null unique,
  first_name varchar(255) not null,
  last_name varchar(255),
  email varchar(255) not null unique,
  phone_number varchar(20) not null unique,
  "password" varchar(255) not null,
  created timestamp not null
);

create table "event" (
  id uuid primary key default gen_random_uuid(),
  "name" varchar(255) not null unique,
  "description" varchar(400),
  created timestamp not null,
  "private" boolean not null,
  active boolean not null default true,
  usernames_only boolean not null
);
create index idx_event_created on "event"(created);

create table user_event (
  user_id uuid references "user"(id) on delete cascade,
  event_id uuid references "event"(id) on delete cascade,
  joined_time timestamp not null,
  "admin" boolean not null,
  primary key (user_id, event_id)
);

create table category (
  id uuid primary key default gen_random_uuid(),
  "name" varchar(255) not null,
  icon varchar(255),
  weighted boolean not null,
  event_id uuid references "event"(id) on delete cascade,
  created timestamp not null
);
create index idx_category_created on category(created);

create table expense (
  id uuid primary key default gen_random_uuid(),
  "name" varchar(255) not null,
  "description" varchar(255),
  amount numeric(16, 2) not null,
  category_id uuid references category(id) on delete cascade,
  payer_id uuid references "user"(id) on delete cascade,
  created timestamp not null
);
create index idx_expense_created on expense(created);

create table user_category (
  user_id uuid references "user"(id) on delete cascade,
  category_id uuid references category(id) on delete cascade,
  "weight" numeric(14),
  primary key (user_id, category_id)
);

create table "session" (
  "sid" varchar(255) not null primary key,
  "session" text not null,
  expires timestamp not null,
  user_id uuid references "user"(id) on delete cascade
);

create table api_key (
  id uuid primary key default gen_random_uuid(),
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
  user_id uuid references "user"(id) on delete set null,
  used boolean not null,
  expires timestamp not null
);

create table password_reset_key (
  "key" varchar(255) primary key,
  user_id uuid references "user"(id) on delete cascade,
  used boolean not null,
  expires timestamp not null
);
