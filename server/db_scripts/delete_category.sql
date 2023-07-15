drop function if exists delete_category;
create or replace function delete_category(
  ip_category_id uuid
)
returns void as
$$
begin

  if not exists (select 1 from category c where c.id = ip_category_id) then
    raise exception 'Category not found' using errcode = 'P0007';
  end if;

  delete from category c where c.id = ip_category_id;

end;
$$
language plpgsql;
