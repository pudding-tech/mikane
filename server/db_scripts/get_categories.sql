drop function if exists get_categories;
create or replace function get_categories(
  ip_event_uuid uuid,
  ip_category_uuid uuid
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
  tmp_category_id int;
begin
  
  select e.id into tmp_event_id from "event" e where e.uuid = ip_event_uuid;
  select c.id into tmp_category_id from category c where c.uuid = ip_category_uuid;

  if ip_event_uuid is not null and not exists (select 1 from "event" e where e.id = tmp_event_id) then
    raise exception 'Event not found' using errcode = 'P0006';
  end if;

  if ip_category_uuid is not null and not exists (select 1 from "category" c where c.id = tmp_category_id) then
    raise exception 'Category not found' using errcode = 'P0007';
  end if;

  create temp table if not exists
    weights_temp
  as
  select
    uc.user_id,
    c.id as category_id,
    case
      when c.weighted = true then uc.weight
      when c.weighted = false then 1
    end as weight
  from user_category uc
    inner join category c on c.id = uc.category_id
  where
    c.id = coalesce(tmp_category_id, c.id) and
    c.event_id = coalesce(tmp_event_id, c.event_id);

  return query
  select
    c.uuid,
    c.name,
    c.icon,
    c.weighted,
    e.uuid as event_uuid,
    (
      select
        jsonb_agg(jsonb_build_object(
          'user_uuid', u.uuid,
          'username', u.username,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'weight', wt.weight
        ))
      from
        user_category uc
        inner join "user" u ON u.id = uc.user_id
        inner join weights_temp wt ON wt.user_id = uc.user_id AND wt.category_id = uc.category_id
      where
        uc.category_id = c.id
    ) as user_weights
  from category c
    inner join "event" e on c.event_id = e.id
  where
    c.id = coalesce(tmp_category_id, c.id) and
    c.event_id = coalesce(tmp_event_id, c.event_id);

  drop table if exists weights_temp;

end;
$$
language plpgsql;
