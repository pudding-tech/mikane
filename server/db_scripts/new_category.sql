drop function if exists new_category;
create or replace function new_category(
  ip_name varchar(255),
  ip_icon varchar(255),
  ip_weighted boolean,
  ip_event_id uuid,
  ip_by_user_id uuid
)
returns table (
  id uuid,
  "name" varchar(255),
  icon varchar(255),
  weighted boolean,
  event_id uuid,
  created timestamp,
  number_of_expenses int,
  user_weights jsonb
) as
$$
declare
  tmp_category_id uuid;
begin

  if not exists (select 1 from "event" e where e.id = ip_event_id) then
    raise exception 'Event not found' using errcode = 'P0006';
  end if;

  if not exists (
    select 1 from "event" e
      left join user_event ue on e.id = ue.event_id and ue.user_id = ip_by_user_id
    where
      e.id = ip_event_id and
      (e.private = false or (e.private = true and ue.user_id = ip_by_user_id))
  ) then
    raise exception 'Cannot access private event' using errcode = 'P0138';
  end if;

  if exists (select 1 from "event" e where e.id = ip_event_id and e.status != 1) then
    raise exception 'Only active events can be edited' using errcode = 'P0118';
  end if;

  if exists (select 1 from category c where c.name ilike ip_name and c.event_id = ip_event_id) then
    raise exception 'Another category in this event already has this name' using errcode = 'P0097';
  end if;

  insert into "category"(event_id, "name", icon, weighted, created)
    values (ip_event_id, ip_name, ip_icon, ip_weighted, CURRENT_TIMESTAMP)
    returning "category".id into tmp_category_id;

  return query
  select * from get_categories(null, tmp_category_id, ip_by_user_id);

end;
$$
language plpgsql;
