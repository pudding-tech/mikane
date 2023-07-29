drop function if exists remove_user_from_event;
create or replace function remove_user_from_event(
  ip_event_id uuid,
  ip_user_id uuid
)
returns table (
  id uuid,
  "name" varchar(255),
  "description" varchar(255),
  created timestamp,
  "private" boolean,
  admin_ids jsonb,
  user_id uuid,
  user_in_event boolean,
  user_is_admin boolean
) as
$$
declare
  tmp_number_of_admins int;
begin

  if not exists (select 1 from "event" e where e.id = ip_event_id) then
    raise exception 'Event not found' using errcode = 'P0006';
  end if;

  if not exists (select 1 from "user" u where u.id = ip_user_id) then
    raise exception 'User not found' using errcode = 'P0008';
  end if;

  if exists (select 1 from expense ex inner join category c on ex.category_id = c.id where c.event_id = ip_event_id and ex.payer_id = ip_user_id) then
    raise exception 'Cannot remove user from event, as the user has one or more expenses in the event' using errcode = 'P0114';
  end if;

  select count(*) into tmp_number_of_admins from user_event ue where ue.event_id = ip_event_id and ue."admin" = true;
  if exists (select 1 from user_event ue where ue.event_id = ip_event_id and ue.user_id = ip_user_id and ue."admin" = true) and (tmp_number_of_admins < 2) then
    raise exception 'Cannot remove user from event, as the user is the only event admin and all events need at least one event admin' using errcode = 'P0098';
  end if;

  -- Remove user from the event
  delete from user_event ue where ue.event_id = ip_event_id and ue.user_id = ip_user_id;

  -- Remove user from all categories belonging to the event
  delete from user_category duc
  where (duc.category_id, duc.user_id) in (
    select
      uc.category_id, uc.user_id
    from
      user_category uc
      inner join category c on c.id = uc.category_id
      inner join "event" e on e.id = c.event_id
    where
      e.id = ip_event_id and
      uc.user_id = ip_user_id
  );

  return query
  select * from get_events(ip_event_id, null);

end;
$$
language plpgsql;
