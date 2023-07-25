drop function if exists verify_register_account_key;
create or replace function verify_register_account_key(
  ip_key varchar(255)
)
returns table (
  email varchar(255)
) as
$$
begin

  return query
  select
    rak.email
  from
    register_account_key rak
  where
    rak."key" = ip_key and
    rak.used = false and
    rak.expires > CURRENT_TIMESTAMP;

end;
$$
language plpgsql;
