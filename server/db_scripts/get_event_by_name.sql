drop function if exists get_event_by_name;
create or replace function get_event_by_name(
  ip_event_name varchar(255),
  ip_by_user_id uuid,
  ip_is_api_key boolean
)
returns table (
  id uuid,
  "name" varchar(255),
  "description" varchar(255),
  created timestamp,
  "private" boolean,
  status int,
  status_name varchar(255),
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

  if not exists (select 1 from "event" e where e.id = tmp_event_id) then
    raise exception 'Event not found' using errcode = 'P0006';
  end if;

  if (ip_by_user_id is not null) and not exists (
    select 1 from "event" e
      left join user_event ue on e.id = ue.event_id and ue.user_id = ip_by_user_id
    where
      e.id = tmp_event_id and
      (e.private = false or (e.private = true and ue.user_id = ip_by_user_id))
  ) then
    raise exception 'Cannot access private event' using errcode = 'P0138';
  end if;

  return query
  select * from get_events(tmp_event_id, ip_by_user_id, false, ip_is_api_key);

end;
$$
language plpgsql;
