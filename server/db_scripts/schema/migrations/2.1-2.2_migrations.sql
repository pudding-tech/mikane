create table event_status_type (
  id int primary key,
  name varchar(255) not null
);

insert into event_status_type (id, name)
  values (1, 'Active'), (2, 'Ready to settle'), (3, 'Archived');

ALTER TABLE "event"
ADD status int not null references "event_status_type"(id) on delete restrict default 1;

ALTER TABLE "event"
DROP COLUMN active;

ALTER TABLE "user"
ADD super_admin boolean not null default false,
ADD guest_created_by uuid;
