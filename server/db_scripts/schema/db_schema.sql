create table event_status_type (
  id int primary key,
  name varchar(255) not null
);

create table "user" (
  id uuid primary key default gen_random_uuid(),
  username varchar(255) not null unique,
  first_name varchar(255) not null,
  last_name varchar(255),
  email varchar(255) unique,
  phone_number varchar(255) unique,
  "password" varchar(255) not null,
  created timestamp not null,
  guest boolean not null,
  guest_created_by uuid,
  super_admin boolean not null,
  deleted boolean not null
);

create table "event" (
  id uuid primary key default gen_random_uuid(),
  "name" varchar(255) not null unique,
  "description" varchar(400),
  created timestamp not null,
  "private" boolean not null,
  status int not null references "event_status_type"(id) on delete restrict,
  usernames_only boolean not null
);
create index idx_event_created on "event"(created);

create table user_event (
  user_id uuid not null references "user"(id) on delete cascade,
  event_id uuid not null references "event"(id) on delete cascade,
  joined_time timestamp not null,
  "admin" boolean not null,
  primary key (user_id, event_id)
);

create table category (
  id uuid primary key default gen_random_uuid(),
  "name" varchar(255) not null,
  icon varchar(255),
  weighted boolean not null,
  event_id uuid not null references "event"(id) on delete cascade,
  created timestamp not null
);
create index idx_category_created on category(created);

create table user_category (
  user_id uuid not null references "user"(id) on delete cascade,
  category_id uuid not null references category(id) on delete cascade,
  "weight" numeric(14),
   joined_time timestamp not null,
  primary key (user_id, category_id)
);

create table expense (
  id uuid primary key default gen_random_uuid(),
  "name" varchar(255) not null,
  "description" varchar(255),
  amount numeric(16, 2) not null,
  category_id uuid not null references category(id) on delete cascade,
  payer_id uuid references "user"(id) on delete cascade,
  expense_date date,
  created timestamp not null
);
create index idx_expense_created on expense(created);

create table "session" (
  "sid" varchar(255) not null primary key,
  "session" json not null,
  expires timestamp not null,
  user_id uuid not null references "user"(id) on delete cascade
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
  user_id uuid references "user"(id) on delete cascade,
  used boolean not null,
  expires timestamp not null
);

create table delete_account_key (
  "key" varchar(255) primary key,
  user_id uuid not null references "user"(id) on delete set null,
  used boolean not null,
  expires timestamp not null
);

create table password_reset_key (
  "key" varchar(255) primary key,
  user_id uuid not null references "user"(id) on delete cascade,
  used boolean not null,
  expires timestamp not null
);

create table user_preferences (
  user_id uuid not null references "user"(id) on delete cascade,
  public_email boolean not null,
  public_phone boolean not null,
  primary key (user_id)
);

insert into event_status_type (id, name)
  values (1, 'Active'), (2, 'Ready to settle'), (3, 'Settled');

create extension if not exists pgcrypto;
