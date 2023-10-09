drop function if exists add_user_to_category;
create or replace function add_user_to_category(
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
declare
  tmp_event_id uuid;
  tmp_weighted boolean;
begin

  select c.event_id into tmp_event_id from category c where c.id = ip_category_id;
  select c.weighted into tmp_weighted from category c where c.id = ip_category_id;

  if not exists (select 1 from category c where c.id = ip_category_id) then
    raise exception 'Category not found' using errcode = 'P0007';
  end if;

  if not exists (select 1 from "user" u where u.id = ip_user_id and u.deleted = false) then
    raise exception 'User not found' using errcode = 'P0008';
  end if;

  if exists (select 1 from "event" e inner join category c on c.event_id = e.id where c.id = ip_category_id and e.status != 1) then
    raise exception 'Only active events can be edited' using errcode = 'P0118';
  end if;

  if not exists (select 1 from user_event ue where ue.event_id = tmp_event_id and ue.user_id = ip_user_id) then
    raise exception 'User not in event, cannot be added to category' using errcode = 'P0010';
  end if;

  if exists (select 1 from user_category uc where uc.category_id = ip_category_id and uc.user_id = ip_user_id) then
    raise exception 'User is already in this category' using errcode = 'P0011';
  end if;

  if (tmp_weighted = true and ip_weight is null) then
    raise exception 'Weight required when adding user to weighted category' using errcode = 'P0012';
  elsif (tmp_weighted = true) then
    insert into user_category(user_id, category_id, weight, joined_time) values (ip_user_id, ip_category_id, ip_weight, CURRENT_TIMESTAMP);
  else
    insert into user_category(user_id, category_id, joined_time) values (ip_user_id, ip_category_id, CURRENT_TIMESTAMP);
  end if;

  return query
  select * from get_categories(null, ip_category_id);

end;
$$
language plpgsql;
