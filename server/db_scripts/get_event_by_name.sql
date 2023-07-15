drop function if exists get_event_by_name;
create or replace function get_event_by_name(
  ip_event_name varchar(255),
  ip_user_id uuid
)
returns table (
  id uuid,
  "name" varchar(255),
  "description" varchar(255),
  created timestamp,
  "private" boolean,
  admin_ids jsonb,
  user_id uuid,
  user_in_event boolean,
  user_is_admin boolean
) as
$$
declare
  tmp_event_id uuid;
begin

  select e.id into tmp_event_id from "event" e where e.name ilike ip_event_name;

  return query
  select * from get_events(tmp_event_id, ip_user_id);
  
end;
$$
language plpgsql;
