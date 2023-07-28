drop function if exists new_event;
create or replace function new_event(
  ip_name varchar(255),
  ip_description varchar(400),
  ip_user_id uuid,
  ip_private boolean,
  ip_active boolean,
  ip_usernames_only boolean
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
  if exists (select 1 from "event" e where e.name ilike ip_name) then
    raise exception 'Another event already has this name' using errcode = 'P0005';
  end if;

  if not exists (select 1 from "user" u where u.id = ip_user_id and u.deleted = false) then
    raise exception 'User not found' using errcode = 'P0008';
  end if;

  insert into "event"("name", "description", created, "private", active, usernames_only)
    values (ip_name, ip_description, CURRENT_TIMESTAMP, ip_private, ip_active, ip_usernames_only)
    returning "event".id into tmp_event_id;

  return query
  select * from add_user_to_event(tmp_event_id, ip_user_id, true);
end;
$$
language plpgsql;
