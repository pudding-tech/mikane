drop function if exists add_user_to_event;
create or replace function add_user_to_event(
  ip_event_id uuid,
  ip_user_id uuid,
  ip_admin boolean
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
begin

  if not exists (select 1 from "event" e where e.id = ip_event_id) then
    raise exception 'Event not found' using errcode = 'P0006';
  end if;

  if not exists (select 1 from "user" u where u.id = ip_user_id and u.deleted = false) then
    raise exception 'User not found' using errcode = 'P0008';
  end if;

  if exists (select 1 from "event" e where e.id = ip_event_id and e.status != 1) then
    raise exception 'Only active events can be edited' using errcode = 'P0118';
  end if;

  if exists (select 1 from user_event ue where ue.event_id = ip_event_id and ue.user_id = ip_user_id) then
    raise exception 'User is already in this event' using errcode = 'P0009';
  end if;

  insert into user_event(user_id, event_id, joined_time, "admin")
    values (ip_user_id, ip_event_id, CURRENT_TIMESTAMP, ip_admin);

  return query
  select * from get_events(ip_event_id, null, false);

end;
$$
language plpgsql;
