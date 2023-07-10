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
  "uuid" uuid,
  username varchar(255),
  first_name varchar(255),
  last_name varchar(255),
  email varchar(255),
  phone_number varchar(20),
  "password" varchar(255),
  created timestamp
) as
$$
declare tmp_user_uuid uuid;
begin
  if exists (select u.id from "user" u where u.username = ip_username) then
    raise exception 'Username already taken' using errcode = 'P0017';
  end if;

  if exists (select u.id from "user" u where u.email = ip_email) then
    raise exception 'Email address already taken' using errcode = 'P0018';
  end if;

  if exists (select u.id from "user" u where u.phone_number = ip_phone_number) then
    raise exception 'Phone number already taken' using errcode = 'P0019';
  end if;

  insert into "user"(username, first_name, last_name, email, phone_number, "password", created)
    values (ip_username, ip_first_name, nullif(ip_last_name, ''), ip_email, ip_phone_number, ip_password, CURRENT_TIMESTAMP)
    returning "user".uuid into tmp_user_uuid;

  return query
  select * from get_user(tmp_user_uuid, null);
end;
$$
language plpgsql;
