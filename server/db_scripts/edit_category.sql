drop function if exists edit_category;
create or replace function edit_category(
  ip_category_id uuid,
  ip_name varchar(255),
  ip_icon varchar(255),
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

  if ip_category_id is not null and not exists (select 1 from "category" c where c.id = ip_category_id) then
    raise exception 'Category not found' using errcode = 'P0007';
  end if;

  if not exists (
    select 1 from category c
      inner join "event" e on c.event_id = e.id
      left join user_event ue on e.id = ue.event_id and ue.user_id = ip_by_user_id
    where
      c.id = ip_category_id and
      (e.private = false or (e.private = true and ue.user_id = ip_by_user_id))
  ) then
    raise exception 'Cannot access private event' using errcode = 'P0138';
  end if;

  if exists (select 1 from "event" e inner join category c on c.event_id = e.id where c.id = ip_category_id and e.status != 1) then
    raise exception 'Only active events can be edited' using errcode = 'P0118';
  end if;

  update
    category c
  set
    "name" = coalesce(ip_name, c.name),
    icon = coalesce(ip_icon, c.icon)
  where
    c.id = ip_category_id;

  return query
  select * from get_categories(null, ip_category_id, ip_by_user_id);

end;
$$
language plpgsql;
