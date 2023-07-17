drop function if exists new_api_key;
create or replace function new_api_key(
  ip_id uuid,
  ip_name varchar(255),
  ip_hashed_key varchar(255),
  ip_master boolean,
  ip_valid_from timestamp,
  ip_valid_to timestamp
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

  if exists (select 1 from api_key k where k.name ilike ip_name) then
    raise exception 'API key name already taken' using errcode = 'P0070';
  end if;

  insert into api_key(id, "name", hashed_key, "master", valid_from, valid_to)
    values (ip_id, ip_name, ip_hashed_key, ip_master, ip_valid_from, ip_valid_to);

  return query
  select
    k.id, k.name, k.hashed_key, k.master, k.valid_from, k.valid_to
  from
    api_key k
  where
    k.id = ip_id;

end;
$$
language plpgsql;
