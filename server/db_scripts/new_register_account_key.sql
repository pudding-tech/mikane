drop function if exists new_register_account_key;
create or replace function new_register_account_key(
  ip_email varchar(255),
  ip_key varchar(255)
)
returns void as
$$
begin

  insert into register_account_key("key", email, used, expires)
    values (ip_key, ip_email, false, CURRENT_TIMESTAMP + INTERVAL '3 days');

end;
$$
language plpgsql;
