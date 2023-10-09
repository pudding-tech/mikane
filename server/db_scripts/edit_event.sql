drop function if exists edit_event;
create or replace function edit_event(
  ip_event_id uuid,
  ip_user_id uuid,
  ip_name varchar(255),
  ip_description varchar(400),
  ip_private boolean,
  ip_status int
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

  if not exists (select 1 from "event" e
                  inner join user_event ue on e.id = ue.event_id
                  where e.id = ip_event_id and ue.user_id = ip_user_id and ue."admin" = true)
  then
    raise exception 'Only event admins can edit event' using errcode = 'P0087';
  end if;

  if exists (select 1 from "event" e where e.id = ip_event_id and e.status != 1) and (ip_status != 1 or ip_status is null) then
    raise exception 'Only active events can be edited' using errcode = 'P0118';
  end if;

  if exists (select 1 from "event" e where e.name ilike ip_name and e.id != ip_event_id) then
    raise exception 'Another event already has this name' using errcode = 'P0005';
  end if;

  update
    "event" e
  set
    "name" = coalesce(ip_name, e.name),
    "description" = nullif(trim(coalesce(ip_description, e.description)), ''),
    "private" = coalesce(ip_private, e.private),
    status = coalesce(ip_status, e.status)
  where
    e.id = ip_event_id;

  return query
  select * from get_events(ip_event_id, ip_user_id, false);

end;
$$
language plpgsql;
