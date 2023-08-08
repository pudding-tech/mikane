drop function if exists get_user;
create or replace function get_user(
  ip_user_id uuid,
  ip_username varchar(255)
)
returns table (
  id uuid,
  username varchar(255),
  first_name varchar(255),
  last_name varchar(255),
  email varchar(255),
  phone_number varchar(20),
  "password" varchar(255),
  created timestamp
) as
$$
begin
  if (ip_user_id is not null) then
    return query
    select
      u.id, u.username, u.first_name, u.last_name, u.email, u.phone_number, u.password, u.created
    from
      "user" u
    where
      u.id = ip_user_id and
      u.deleted = false;
  elsif (ip_username is not null) then
    return query
    select
      u.id, u.username, u.first_name, u.last_name, u.email, u.phone_number, u.password, u.created
    from
      "user" u
    where
      u.username ilike ip_username and
      u.deleted = false;
  end if;
end;
$$
language plpgsql;
