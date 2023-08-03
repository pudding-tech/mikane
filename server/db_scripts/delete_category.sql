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

  if exists (select 1 from "event" e inner join category c on c.event_id = e.id where c.id = ip_category_id and e.active = false) then
    raise exception 'Archived events cannot be edited' using errcode = 'P0118';
  end if;

  delete from category c where c.id = ip_category_id;

end;
$$
language plpgsql;
