drop function if exists new_guest_user;
create or replace function new_guest_user(
  ip_id uuid,
  ip_first_name varchar(255),
  ip_last_name varchar(255),
  ip_by_user_id uuid
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

  if not exists (select 1 from "user" u where u.id = ip_by_user_id) then
    raise exception 'User not found' using errcode = 'P0008';
  end if;

  insert into "user"(id, username, first_name, last_name, email, phone_number, "password", created, guest, guest_created_by, super_admin, deleted)
    values (ip_id, ip_id, ip_first_name, nullif(ip_last_name, ''), null, null, '1', CURRENT_TIMESTAMP, true, ip_by_user_id, false, false);

  return query
  select * from get_user(ip_id, null, true);

end;
$$
language plpgsql;
