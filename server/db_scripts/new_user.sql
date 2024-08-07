drop function if exists new_user;
create or replace function new_user(
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
  super_admin boolean,
  public_email boolean,
  public_phone boolean
) as
$$
declare tmp_user_id uuid;
begin
  if exists (select u.id from "user" u where u.username ilike ip_username) then
    raise exception 'Username already taken' using errcode = 'P0017';
  end if;

  if exists (select u.id from "user" u where u.email ilike ip_email) then
    raise exception 'Email address already taken' using errcode = 'P0018';
  end if;

  if exists (select u.id from "user" u where u.phone_number ilike ip_phone_number) then
    raise exception 'Phone number already taken' using errcode = 'P0019';
  end if;

  insert into "user"(username, first_name, last_name, email, phone_number, "password", created, guest, super_admin, deleted)
    values (ip_username, ip_first_name, nullif(ip_last_name, ''), nullif(ip_email, ''), nullif(ip_phone_number, ''), ip_password, CURRENT_TIMESTAMP, false, false, false)
    returning "user".id into tmp_user_id;

  insert into user_preferences (user_id, public_email, public_phone)
    values (tmp_user_id, false, true);

  return query
  select * from get_user(tmp_user_id, null, false);
end;
$$
language plpgsql;
