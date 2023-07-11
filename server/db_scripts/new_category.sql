drop function if exists new_category;
create or replace function new_category(
  ip_name varchar(255),
  ip_icon varchar(255),
  ip_weighted boolean,
  ip_event_uuid uuid
)
returns table (
  "uuid" uuid,
  "name" varchar(255),
  icon varchar(255),
  weighted boolean,
  event_uuid uuid,
  user_weights jsonb
) as
$$
declare
  tmp_event_id int;
  tmp_category_uuid uuid;
begin

  select e.id into tmp_event_id from "event" e where e.uuid = ip_event_uuid;

  if not exists (select 1 from "event" e where e.id = tmp_event_id) then
    raise exception 'Event not found' using errcode = 'P0006';
  end if;

  if exists (select 1 from "category" c where c.name = ip_name and c.event_id = tmp_event_id) then
    raise exception 'Another category in this event already has this name' using errcode = 'P0097';
  end if;

  insert into "category"(event_id, "name", icon, weighted)
    values (tmp_event_id, ip_name, ip_icon, ip_weighted)
    returning "category".uuid into tmp_category_uuid;

  return query
  select * from get_categories(null, tmp_category_uuid);

end;
$$
language plpgsql;
