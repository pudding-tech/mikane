drop function if exists delete_event;
create or replace function delete_event(
  ip_event_id uuid,
  ip_user_id uuid
)
returns void as
$$
begin

  if not exists (select 1 from "event" e where e.id = ip_event_id) then
    raise exception 'Event not found' using errcode = 'P0006';
  end if;

  if not exists (select 1 from "event" e
                  inner join user_event ue on e.id = ue.event_id
                  where e.id = ip_event_id and ue.user_id = ip_user_id and ue."admin" = true)
  then
    raise exception 'Only event admins can delete event' using errcode = 'P0085';
  end if;

  if exists (select 1 from "event" e where e.id = ip_event_id and e.active = false) then
    raise exception 'Archived events cannot be deleted' using errcode = 'P0119';
  end if;

  delete from "event" e where e.id = ip_event_id;

end;
$$
language plpgsql;
