drop function if exists delete_event;
create or replace function delete_event(
  ip_event_id uuid,
  ip_by_user_id uuid
)
returns void as
$$
begin

  if not exists (select 1 from "event" e where e.id = ip_event_id) then
    raise exception 'Event not found' using errcode = 'P0006';
  end if;

  if not exists (
    select 1 from "event" e
      left join user_event ue on e.id = ue.event_id and ue.user_id = ip_by_user_id
    where
      e.id = ip_event_id and
      (e.private = false or (e.private = true and ue.user_id = ip_by_user_id))
  ) then
    raise exception 'Cannot access private event' using errcode = 'P0138';
  end if;

  if not exists (select 1 from "event" e
                  inner join user_event ue on e.id = ue.event_id
                  where e.id = ip_event_id and ue.user_id = ip_by_user_id and ue."admin" = true)
  then
    raise exception 'Only event admins can delete event' using errcode = 'P0085';
  end if;

  if exists (select 1 from "event" e where e.id = ip_event_id and e.status != 1) then
    raise exception 'Settled events cannot be deleted' using errcode = 'P0119';
  end if;

  delete from "event" e where e.id = ip_event_id;

end;
$$
language plpgsql;
