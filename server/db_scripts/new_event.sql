drop function if exists new_event;
create or replace function new_event(
  ip_name varchar(255),
  ip_description varchar(400),
  ip_user_uuid uuid,
  ip_private boolean,
  ip_active boolean,
  ip_usernames_only boolean
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
declare tmp_event_uuid uuid;
begin
  if exists (select 1 from "event" e where e.name = ip_name) then
    raise exception 'Another event already has this name' using errcode = 'P0005';
  end if;

  if not exists (select 1 from "user" u where u.uuid = ip_user_uuid) then
    raise exception 'User not found' using errcode = 'P0008';
  end if;

  insert into "event"("name", "description", created, "private", active, usernames_only)
    values (ip_name, ip_description, CURRENT_TIMESTAMP, ip_private, ip_active, ip_usernames_only)
    returning "event".uuid into tmp_event_uuid;

  return query
  select * from add_user_to_event(tmp_event_uuid, ip_user_uuid, true);
end;
$$
language plpgsql;
