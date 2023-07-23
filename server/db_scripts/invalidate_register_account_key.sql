drop function if exists invalidate_register_account_key;
create or replace function invalidate_register_account_key(
  ip_key varchar(255)
)
returns void as
$$
begin

  update register_account_key rak set used = true where rak."key" = ip_key;

end;
$$
language plpgsql;
