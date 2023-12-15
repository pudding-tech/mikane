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
  super_admin boolean
) as
$$
begin
  if (ip_user_id is not null) then
    return query
    select
      u.id, u.username, u.first_name, u.last_name, u.email, u.phone_number, u.password, u.created, u.guest, u.guest_created_by, u.super_admin
    from
      "user" u
    where
      u.id = ip_user_id and
      u.deleted = false and
      u.guest = case when ip_allow_guest = true then u.guest else false end;
  elsif (ip_username is not null) then
    return query
    select
      u.id, u.username, u.first_name, u.last_name, u.email, u.phone_number, u.password, u.created, u.guest, u.guest_created_by, u.super_admin
    from
      "user" u
    where
      u.username ilike ip_username and
      u.deleted = false and
      u.guest = case when ip_allow_guest = true then u.guest else false end;
  end if;
end;
$$
language plpgsql;
