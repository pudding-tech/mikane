drop function if exists edit_user;
create or replace function edit_user(
  ip_user_id uuid,
  ip_username varchar(255),
  ip_first_name varchar(255),
  ip_last_name varchar(255),
  ip_email varchar(255),
  ip_phone_number varchar(20)
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

  if not exists (select 1 from "user" u where u.id = ip_user_id and u.deleted = false) then
    raise exception 'User not found' using errcode = 'P0008';
  end if;

  if ip_username is not null and exists (select 1 from "user" u where u.username ilike ip_username and u.id != ip_user_id) then
    raise exception 'Username already taken' using errcode = 'P0017';
  end if;

  if ip_email is not null and exists (select 1 from "user" u where u.email ilike ip_email and u.id != ip_user_id) then
    raise exception 'Email address already taken' using errcode = 'P0018';
  end if;

  if ip_phone_number is not null and exists (select 1 from "user" u where u.phone_number ilike ip_phone_number and u.id != ip_user_id) then
    raise exception 'Phone number already taken' using errcode = 'P0019';
  end if;

  update
    "user" u
  set
    username = coalesce(ip_username, u.username),
    first_name = coalesce(ip_first_name, u.first_name),
    last_name = nullif(trim(coalesce(ip_last_name, u.last_name)), ''),
    email = coalesce(ip_email, u.email),
    phone_number = coalesce(ip_phone_number, u.phone_number)
  where
    u.id = ip_user_id and
    u.deleted = false;
  
  return query
  select * from get_user(ip_user_id, null, false);

end;
$$
language plpgsql;
