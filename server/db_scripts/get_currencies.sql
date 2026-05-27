drop function if exists get_currencies;
create or replace function get_currencies(
)
returns table (
  code varchar(3),
  "name" varchar(255)
) as
$$
begin
  return query
  select
    c.code, c."name"
  from
    currency c
  order by
    c.sort_order asc;
end;
$$
language plpgsql;
