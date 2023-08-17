drop function if exists new_guest_user;
create or replace function new_guest_user(
  ip_id uuid,
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

  insert into "user"(id, username, first_name, last_name, email, phone_number, "password", created, guest, deleted)
    values (ip_id, ip_id, ip_first_name, nullif(ip_last_name, ''), null, null, '1', CURRENT_TIMESTAMP, true, false);

  return query
  select * from get_user(ip_id, null, true);

end;
$$
language plpgsql;
