drop function if exists edit_guest_user;
create or replace function edit_guest_user(
  ip_guest_id uuid,
  ip_first_name varchar(255),
  ip_last_name varchar(255)
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
  guest boolean
) as
$$
begin

  if not exists (select 1 from "user" u where u.id = ip_guest_id and u.guest = true and u.deleted = false) then
    raise exception 'Guest user not found' using errcode = 'P0122';
  end if;

  update
    "user" u
  set
    first_name = coalesce(ip_first_name, u.first_name),
    last_name = nullif(trim(coalesce(ip_last_name, u.last_name)), '')
  where
    u.id = ip_guest_id and
    u.guest = true and
    u.deleted = false;
  
  return query
  select * from get_user(ip_guest_id, null, true);

end;
$$
language plpgsql;
