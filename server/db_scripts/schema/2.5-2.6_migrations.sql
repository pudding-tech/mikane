create table currency (
  code varchar(3) primary key,
  "name" varchar(255) not null,
  sort_order int not null
);

insert into currency (code, "name", sort_order)
  values ('USD', 'US Dollar', 2), ('EUR', 'Euro', 3), ('GBP', 'British Pound', 4), ('CAD', 'Canadian Dollar', 5), ('AUD', 'Australian Dollar', 6),
    ('NOK', 'Norwegian Krone', 1), ('SEK', 'Swedish Krona', 7), ('DKK', 'Danish Krone', 8), ('JPY', 'Japanese Yen', 9), ('CNY', 'Chinese Yuan', 10),
    ('KRW', 'South Korean Won', 11), ('CHF', 'Swiss Franc', 12);

alter table "event"
  add currency varchar(3) not null default 'NOK' references currency(code) on delete restrict;
alter table "event"
  alter column currency drop default;

alter table expense
  add currency varchar(3) null references currency(code) on delete restrict;
