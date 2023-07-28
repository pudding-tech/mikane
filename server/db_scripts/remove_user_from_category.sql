drop function if exists remove_user_from_category;
create or replace function remove_user_from_category(
  ip_category_id uuid,
  ip_user_id uuid
)
returns table (
  id uuid,
  name varchar(255),
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

  if not exists (select 1 from "user" u where u.id = ip_user_id and u.deleted = false) then
    raise exception 'User not found' using errcode = 'P0008';
  end if;

  delete from user_category uc where uc.category_id = ip_category_id and uc.user_id = ip_user_id;

  return query
  select * from get_categories(null, ip_category_id);

end;
$$
language plpgsql;
