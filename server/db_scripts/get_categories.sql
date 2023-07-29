drop function if exists get_categories;
create or replace function get_categories(
  ip_event_id uuid,
  ip_category_id uuid
)
returns table (
  id uuid,
  "name" varchar(255),
  icon varchar(255),
  weighted boolean,
  event_id uuid,
  created timestamp,
  user_weights jsonb
) as
$$
begin
  
  if ip_event_id is not null and not exists (select 1 from "event" e where e.id = ip_event_id) then
    raise exception 'Event not found' using errcode = 'P0006';
  end if;

  if ip_category_id is not null and not exists (select 1 from "category" c where c.id = ip_category_id) then
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
    c.id = coalesce(ip_category_id, c.id) and
    c.event_id = coalesce(ip_event_id, c.event_id);

  return query
  select
    c.id,
    c.name,
    c.icon,
    c.weighted,
    e.id as event_id,
    c.created,
    (
      select
        jsonb_agg(jsonb_build_object(
          'user_id', u.id,
          'username', u.username,
          'first_name', u.first_name,
          'last_name', u.last_name,
          'email', u.email,
          'weight', wt.weight,
          'deleted', u.deleted
        ) order by uc.joined_time asc)
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
    c.id = coalesce(ip_category_id, c.id) and
    c.event_id = coalesce(ip_event_id, c.event_id)
  order by
    c.created desc;

  drop table if exists weights_temp;

end;
$$
language plpgsql;
