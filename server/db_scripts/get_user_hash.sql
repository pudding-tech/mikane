drop function if exists get_user_hash;
create or replace function get_user_hash(
  ip_username_email varchar(255),
  ip_user_id uuid
)
returns table (
  id uuid,
  "password" varchar(255)
) as
$$
begin
  if (ip_user_id is not null) then
    return query
    select
      u.id, u.password
    from
      "user" u
    where
      u.id = ip_user_id;
  else
    return query
    select
      u.id, u.password
    from
      "user" u
    where
      u.username ilike ip_username_email or
      u.email ilike ip_username_email;
  end if;
end;
$$
language plpgsql;
