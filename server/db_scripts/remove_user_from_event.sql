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
begin

  if not exists (select 1 from "event" e where e.id = ip_event_id) then
    raise exception 'Event not found' using errcode = 'P0006';
  end if;

  if not exists (select 1 from "user" u where u.id = ip_user_id) then
    raise exception 'User not found' using errcode = 'P0008';
  end if;

  delete from user_event ue where ue.event_id = ip_event_id and ue.user_id = ip_user_id;

  -- Delete expenses belonging to user from event
  delete from expense e
  where e.id in (
    select ex.id
    from expense ex
      inner join category c on ex.category_id = c.id
    where c.event_id = ip_event_id and ex.payer_id = ip_user_id
  );

  return query
  select * from get_events(ip_event_id, null);

end;
$$
language plpgsql;
