create table currency (
  code varchar(3) primary key,
  "name" varchar(255) not null,
  format_locale varchar(10) not null,
  sort_order int not null
);

insert into currency (code, "name", format_locale, sort_order)
  values
    ('NOK', 'Norwegian Krone', 'nb-NO', 1),
    ('USD', 'US Dollar', 'en-US', 2),
    ('EUR', 'Euro', 'de-DE', 3),
    ('GBP', 'British Pound', 'en-GB', 4),
    ('CAD', 'Canadian Dollar', 'en-CA', 5),
    ('AUD', 'Australian Dollar', 'en-AU', 6),
    ('SEK', 'Swedish Krona', 'sv-SE', 7),
    ('DKK', 'Danish Krone', 'da-DK', 8),
    ('JPY', 'Japanese Yen', 'ja-JP', 9),
    ('CNY', 'Chinese Yuan', 'zh-CN', 10),
    ('KRW', 'South Korean Won', 'ko-KR', 11),
    ('CHF', 'Swiss Franc', 'de-CH', 12);

alter table "event"
  add currency varchar(3) not null default 'NOK' references currency(code) on delete restrict;
alter table "event"
  alter column currency drop default;

alter table expense
  add currency varchar(3) null references currency(code) on delete restrict;
