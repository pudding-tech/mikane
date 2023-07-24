drop function if exists verify_delete_account_key;
create or replace function verify_delete_account_key(
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
    delete_account_key dak
  where
    dak."key" = ip_key and
    dak.used = false and
    dak.expires > CURRENT_TIMESTAMP;

end;
$$
language plpgsql;
