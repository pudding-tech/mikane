drop function if exists get_config;
create or replace function get_config(
)
returns table (
  id int,
  "name" varchar(255),
  "value" varchar(255),
  "description" varchar(255)
) as
$$
begin
  return query
  select
    c.id, c."name", c."value", c.description
  from
    app_configuration c;
end;
$$
language plpgsql;
