drop function if exists get_event_by_name;
create or replace function get_event_by_name(
  ip_event_name varchar(255),
  ip_by_user_id uuid
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
  tmp_private boolean;
begin

  select e.id, e.private into tmp_event_id, tmp_private from "event" e where e.name ilike ip_event_name;

  if tmp_event_id is null then
    raise exception 'Event not found' using errcode = 'P0006';
  end if;

  -- Prevent leaking of private events
  if ip_by_user_id is null and tmp_private = true then
    raise exception 'Event not found' using errcode = 'P0006';
  end if;

  -- Prevent leaking of private events
  if not exists (
    select 1 from "event" e
      left join user_event ue on e.id = ue.event_id and ue.user_id = ip_by_user_id
    where
      e.id = tmp_event_id and
      (e.private = false or (e.private = true and ue.user_id = ip_by_user_id))
  ) then
    raise exception 'Event not found' using errcode = 'P0006';
  end if;

  return query
  select * from get_events(tmp_event_id, ip_by_user_id, false);

end;
$$
language plpgsql;
