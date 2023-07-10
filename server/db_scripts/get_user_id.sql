drop function if exists get_user_id;
create or replace function get_user_id(
  ip_email varchar(255)
)
returns table (
  "uuid" uuid
) as
$$
begin
  return query
  select
    u.uuid
  from
    "user" u
  where
    u.email = ip_email;
end;
$$
language plpgsql;
