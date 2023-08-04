drop function if exists edit_user_weight;
create or replace function edit_user_weight(
  ip_category_id uuid,
  ip_user_id uuid,
  ip_weight numeric(14)
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

  if not exists (select 1 from category c where c.id = ip_category_id) then
    raise exception 'Category not found' using errcode = 'P0007';
  end if;

  if exists (select 1 from "event" e inner join category c on c.event_id = e.id where c.id = ip_category_id and e.active = false) then
    raise exception 'Archived events cannot be edited' using errcode = 'P0118';
  end if;

  update
    user_category uc
  set
    weight = ip_weight
  where
    uc.user_id = ip_user_id and
    uc.category_id = ip_category_id;
  
  return query
  select * from get_categories(null, ip_category_id);

end;
$$
language plpgsql;
