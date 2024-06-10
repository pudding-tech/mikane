drop function if exists delete_category;
create or replace function delete_category(
  ip_category_id uuid,
  ip_by_user_id uuid
)
returns void as
$$
begin

  if not exists (select 1 from category c where c.id = ip_category_id) then
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

  if exists (select 1 from expense ex inner join category c on ex.category_id = c.id where c.id = ip_category_id) then
    raise exception 'Cannot delete category, as it has at least one expense associated with it' using errcode = 'P0131';
  end if;

  delete from category c where c.id = ip_category_id;

end;
$$
language plpgsql;
