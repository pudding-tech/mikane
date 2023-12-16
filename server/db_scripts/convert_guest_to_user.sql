drop function if exists convert_guest_to_user;
create or replace function convert_guest_to_user(
  ip_guest_id uuid,
  ip_username varchar(255),
  ip_first_name varchar(255),
  ip_last_name varchar(255),
  ip_email varchar(255),
  ip_phone_number varchar(20),
  ip_password varchar(255)
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
declare tmp_user_id uuid;
begin
  if not exists (select u.id from "user" u where u.id = ip_guest_id and u.guest = true) then
    raise exception 'Guest user not found' using errcode = 'P0122';
  end if;

  if exists (select u.id from "user" u where u.username ilike ip_username) then
    raise exception 'Username already taken' using errcode = 'P0017';
  end if;

  if exists (select u.id from "user" u where u.email ilike ip_email) then
    raise exception 'Email address already taken' using errcode = 'P0018';
  end if;

  if exists (select u.id from "user" u where u.phone_number ilike ip_phone_number) then
    raise exception 'Phone number already taken' using errcode = 'P0019';
  end if;

  update
    "user" u
  set
    username = ip_username,
    first_name = ip_first_name,
    last_name = nullif(ip_last_name, ''),
    email = nullif(ip_email, ''),
    phone_number = nullif(ip_phone_number, ''),
    "password" = ip_password,
    created = CURRENT_TIMESTAMP,
    guest = false,
    guest_created_by = null
  where
    u.id = ip_guest_id and
    u.guest = true and
    u.deleted = false
  returning u.id into tmp_user_id;

  return query
  select * from get_user(tmp_user_id, null, false);
end;
$$
language plpgsql;
