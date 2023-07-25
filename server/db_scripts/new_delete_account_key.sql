drop function if exists new_delete_account_key;
create or replace function new_delete_account_key(
  ip_user_id uuid,
  ip_key varchar(255)
)
returns void as
$$
begin

  insert into delete_account_key("key", user_id, used, expires)
    values (ip_key, ip_user_id, false, CURRENT_TIMESTAMP + INTERVAL '1 hour');

end;
$$
language plpgsql;
