drop function if exists edit_category;
create or replace function edit_category(
  ip_category_id uuid,
  ip_name varchar(255),
  ip_icon varchar(255)
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

  if ip_category_id is not null and not exists (select 1 from "category" c where c.id = ip_category_id) then
    raise exception 'Category not found' using errcode = 'P0007';
  end if;

  update
    category c
  set
    "name" = coalesce(ip_name, c.name),
    icon = coalesce(ip_icon, c.icon)
  where
    c.id = ip_category_id;

  return query
  select * from get_categories(null, ip_category_id);

end;
$$
language plpgsql;
