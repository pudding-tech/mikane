drop function if exists new_api_key;
create or replace function new_api_key(
  ip_user_id uuid,
  ip_key varchar(255)
)
returns void as
$$
begin

  insert into password_reset_key("key", user_id, used, expires)
    values (ip_key, ip_user_id, 0, CURRENT_TIMESTAMP + INTERVAL '1 hour');

end;
$$
language plpgsql;
