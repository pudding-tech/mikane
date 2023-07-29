drop function if exists verify_password_reset_key;
create or replace function verify_password_reset_key(
  ip_key varchar(255)
)
returns table (
  success boolean
) as
$$
begin

  return query
  select
    true as success
  from
    password_reset_key prk
  where
    prk."key" = ip_key and
    prk.used = false and
    prk.expires > CURRENT_TIMESTAMP;

end;
$$
language plpgsql;
