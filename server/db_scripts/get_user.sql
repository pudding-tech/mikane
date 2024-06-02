drop function if exists get_user;
create or replace function get_user(
  ip_user_id uuid,
  ip_username varchar(255),
  ip_allow_guest boolean
)
returns table (
  id uuid,
  username varchar(255),
  first_name varchar(255),
  last_name varchar(255),
  email varchar(255),
  phone_number varchar(20),
  "password" varchar(255),
  created timestamp,
  guest boolean,
  guest_created_by uuid,
  super_admin boolean,
  public_email boolean,
  public_phone boolean
) as
$$
begin
  return query
  select
    u.id, u.username, u.first_name, u.last_name, u.email, u.phone_number, u.password, u.created, u.guest, u.guest_created_by, u.super_admin,
    up.public_email, up.public_phone
  from
    "user" u
    left join user_preferences up on u.id = up.user_id
  where
    (u.id = ip_user_id or (ip_user_id is null and u.username ilike ip_username)) and
    u.deleted = false and
    u.guest = case when ip_allow_guest = true then u.guest else false end;
end;
$$
language plpgsql;
