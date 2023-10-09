drop function if exists add_user_as_event_admin;
create or replace function add_user_as_event_admin(
  ip_event_id uuid,
  ip_user_id uuid,
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
begin

  if not exists (select 1 from "event" e where e.id = ip_event_id) then
    raise exception 'Event not found' using errcode = 'P0006';
  end if;

  if not exists (select 1 from "user" u where u.id = ip_user_id and u.deleted = false) then
    raise exception 'User not found' using errcode = 'P0008';
  end if;

  if not exists (select 1 from "event" e
                  inner join user_event ue on e.id = ue.event_id
                  where e.id = ip_event_id and ue.user_id = ip_by_user_id and ue.admin = true)
  then
    raise exception 'Only event admins can edit event' using errcode = 'P0087';
  end if;

  if exists (select 1 from "user" u where u.id = ip_user_id and u.guest = true) then
    raise exception 'Guest users cannot be event admins' using errcode = 'P0126';
  end if;

  if not exists (select 1 from user_event ue where ue.event_id = ip_event_id and ue.user_id = ip_user_id) then
    raise exception 'User not in event, thus cannot be added as event admin' using errcode = 'P0090';
  end if;

  if exists (select 1 from user_event ue where ue.event_id = ip_event_id and ue.user_id = ip_user_id and ue.admin = true) then
    raise exception 'User is already an admin for this event' using errcode = 'P0091';
  end if;

  update user_event ue set "admin" = true where ue.event_id = ip_event_id and ue.user_id = ip_user_id;

  return query
  select * from get_events(ip_event_id, null, false);

end;
$$
language plpgsql;
