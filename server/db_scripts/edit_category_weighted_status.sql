drop function if exists edit_category_weighted_status;
create or replace function edit_category_weighted_status(
  ip_category_id uuid,
  ip_weighted boolean
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

  update category c set weighted = ip_weighted where c.id = ip_category_id;

  if (ip_weighted = true) then
    if exists (select 1 from user_category uc where uc.category_id = ip_category_id and uc.weight is null) then
      update user_category uc set weight = 1 where category_id = ip_category_id and uc.weight is null;
    end if;
  end if;

  return query
  select * from get_categories(null, ip_category_id);

end;
$$
language plpgsql;
