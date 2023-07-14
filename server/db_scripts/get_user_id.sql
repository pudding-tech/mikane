drop function if exists get_user_id;
create or replace function get_user_id(
  ip_email varchar(255)
)
returns table (
  id uuid
) as
$$
begin
  return query
  select
    u.id
  from
    "user" u
  where
    u.email = ip_email;
end;
$$
language plpgsql;
