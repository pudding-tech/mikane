drop function if exists new_register_account_key;
create or replace function new_register_account_key(
  ip_email varchar(255),
  ip_key varchar(255),
  ip_guest_id uuid
)
returns void as
$$
begin

  if ip_guest_id is not null and not exists (select u.id from "user" u where u.id = ip_guest_id and u.guest = true) then
    raise exception 'Guest user not found' using errcode = 'P0122';
  end if;

  if exists (select u.id from "user" u where u.email ilike ip_email) then
    raise exception 'This email is already associated with another user' using errcode = 'P0103';
  end if;

  insert into register_account_key("key", email, user_id, used, expires)
    values (ip_key, ip_email, ip_guest_id, false, CURRENT_TIMESTAMP + INTERVAL '3 days');

end;
$$
language plpgsql;
