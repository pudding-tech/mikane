drop function if exists get_categories;
create or replace function get_categories(
  ip_event_id uuid,
  ip_category_id uuid,
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
begin

  if (ip_event_id is not null) then
    if not exists (select 1 from "event" e where e.id = ip_event_id) then
      raise exception 'Event not found' using errcode = 'P0006';
    end if;

    if (ip_by_user_id is not null) and not exists (
      select 1 from "event" e
        left join user_event ue on e.id = ue.event_id and ue.user_id = ip_by_user_id
      where
        e.id = ip_event_id and
        (e.private = false or (e.private = true and ue.user_id = ip_by_user_id))
    ) then
      raise exception 'Cannot access private event' using errcode = 'P0138';
    end if;
  end if;

  if (ip_category_id is not null) then
    if not exists (select 1 from "category" c where c.id = ip_category_id) then
      raise exception 'Category not found' using errcode = 'P0007';
    end if;

    if (ip_by_user_id is not null) and not exists (
      select 1 from category c
        inner join "event" e on c.event_id = e.id
        left join user_event ue on e.id = ue.event_id and ue.user_id = ip_by_user_id
      where
        c.id = ip_category_id and
        (e.private = false or (e.private = true and ue.user_id = ip_by_user_id))
    ) then
      raise exception 'Cannot access private event' using errcode = 'P0138';
    end if;
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
        count(e.id)::int
      from
        expense e
      where
        e.category_id = c.id
    ) as number_of_expenses,
    (
      select
        jsonb_agg(jsonb_build_object(
          'user_id', u.id,
          'guest', u.guest,
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
