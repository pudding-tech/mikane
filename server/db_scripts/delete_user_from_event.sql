drop function if exists delete_user_from_event;
create or replace function delete_user_from_event(
  ip_user_id uuid,
  ip_event_id uuid
)
returns void as
$$
begin

  if exists (select 1 from "event" e where e.id = ip_event_id and e.active = false) then
    raise exception 'Cannot delete user from archived event' using errcode = 'P0120';
  end if;

  delete from
    expense ex
  using
    category c
  where
    ex.category_id = c.id and
    c.event_id  = ip_event_id and
    ex.payer_id = ip_user_id;
  
  delete from
    user_category uc
  using
    category c
  where
    c.id = uc.category_id and
    uc.user_id = ip_user_id and
    c.event_id = ip_event_id;

  delete from
    user_event ue
  where
    ue.user_id = ip_user_id and
    ue.event_id = ip_event_id;

end;
$$
language plpgsql;
