alter table "log" rename to "log_server";

alter table "log_server"
  add user_id uuid,
  add session_id varchar(255);

create table log_client (
  id uuid primary key default gen_random_uuid(),
  "timestamp" timestamp not null,
  "level" varchar(50) not null,
  "message" text not null,
  user_id uuid,
  session_id varchar(255),
  ip varchar(255)
);
