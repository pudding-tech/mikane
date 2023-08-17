drop function if exists verify_register_account_key;
create or replace function verify_register_account_key(
  ip_key varchar(255)
)
returns table (
  email varchar(255),
  guest_user boolean,
  first_name varchar(255),
  last_name varchar(255),
  guest_id uuid
) as
$$
begin

  return query
  select
    rak.email,
    (case when u.guest is null then false else u.guest end) as guest_user,
    u.first_name,
    u.last_name,
    rak.user_id as guest_id
  from
    register_account_key rak
    left join "user" u on u.id = rak.user_id
  where
    rak."key" = ip_key and
    rak.used = false and
    rak.expires > CURRENT_TIMESTAMP;

end;
$$
language plpgsql;
