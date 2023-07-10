drop function if exists add_user_to_event;
create or replace function add_user_to_event(
  ip_event_uuid uuid,
  ip_user_uuid uuid,
  ip_admin boolean
)
returns table (
  "uuid" uuid,
  "name" varchar(255),
  "description" varchar(255),
  created timestamp,
  "private" boolean,
  admin_ids JSONB,
  user_uuid uuid,
  user_in_event boolean,
  user_is_admin boolean
) as
$$
declare
  tmp_event_id int;
  tmp_user_id int;
begin

  select e.id into tmp_event_id from "event" e where e.uuid = ip_event_uuid;
  select u.id into tmp_user_id from "user" u where u.uuid = ip_user_uuid;
  RAISE NOTICE 'event id: %', tmp_event_id;
  RAISE NOTICE 'user id: %', tmp_user_id;

  if not exists (select 1 from "event" e where e.id = tmp_event_id) then
    raise exception 'Event not found' using errcode = 'P0006';
  end if;

  if not exists (select 1 from "user" u where u.id = tmp_user_id) then
    raise exception 'User not found' using errcode = 'P0008';
  end if;

  if exists (select 1 from user_event ue where ue.event_id = tmp_event_id and ue.user_id = tmp_user_id) then
    raise exception 'User is already in this event' using errcode = 'P0009';
  end if;

  insert into user_event(user_id, event_id, joined_date, "admin")
    values (tmp_user_id, tmp_event_id, CURRENT_TIMESTAMP, ip_admin);

  return query
  select * from get_events(ip_event_uuid, null);

end;
$$
language plpgsql;
