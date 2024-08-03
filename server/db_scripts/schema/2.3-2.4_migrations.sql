create table app_configuration (
  id int primary key,
  "name" varchar(255) not null unique,
  "value" varchar(255) not null,
  "description" varchar(255)
);

insert into app_configuration (id, "name", "value", "description")
  values (1, 'Default currency', 'USD', 'ISO 4217 code of the default currency used by events');
