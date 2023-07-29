drop function if exists get_api_keys;
create or replace function get_api_keys(
  ip_master boolean
)
returns table (
  id uuid,
  name varchar(255),
  hashed_key varchar(255),
  master boolean,
  valid_from timestamp,
  valid_to timestamp
) as
$$
begin

  return query
  select
    k.id, k.name, k.hashed_key, k.master, k.valid_from, k.valid_to
  from
    api_key k
  where
    k.master = coalesce(ip_master, k.master);

end;
$$
language plpgsql;
