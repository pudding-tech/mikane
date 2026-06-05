create table log (
  id uuid primary key default gen_random_uuid(),
  "timestamp" timestamp not null,
  "level" varchar(50) not null,
  "message" text not null
);
