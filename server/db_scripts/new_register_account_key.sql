drop function if exists new_register_account_key;
create or replace function new_register_account_key(
  ip_email varchar(255),
  ip_key varchar(255)
)
returns void as
$$
begin

  if exists (select u.id from "user" u where u.email ilike ip_email) then
    raise exception 'This email is already associated with another user' using errcode = 'P0103';
  end if;

  insert into register_account_key("key", email, used, expires)
    values (ip_key, ip_email, false, CURRENT_TIMESTAMP + INTERVAL '3 days');

end;
$$
language plpgsql;
