create table user_preferences (
  user_id uuid not null references "user"(id) on delete cascade,
  public_email boolean not null,
  public_phone boolean not null,
  primary key (user_id)
);

update event_status_type set name = 'Settled' where id = 3;

ALTER TABLE expense
ADD expense_date date;
