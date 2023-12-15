drop function if exists delete_guest_user;
create or replace function delete_guest_user(
  ip_guest_id uuid,
  ip_by_user_id uuid
)
returns void as
$$
declare
  tmp_event_id uuid;
begin

  if not exists (select 1 from "user" u where u.id = ip_guest_id and u.guest = true and u.deleted = false) then
    raise exception 'Guest user not found' using errcode = 'P0122';
  end if;

  if not (
    exists (select 1 from "user" u where u.id = ip_by_user_id and u.super_admin = true)
    or
    exists (select 1 from "user" u where u.id = ip_guest_id and u.guest_created_by = ip_by_user_id)
  ) then
    raise exception 'Only super-admins and guests creator can delete guest users' using errcode = 'P0129';
  end if;

  -- Delete user from active events
  for tmp_event_id in select e.id from "event" e where e.status = 1
  loop
    perform delete_user_from_event(ip_guest_id, tmp_event_id);
  end loop;

  update
    "user" u
  set
    first_name = 'deleted',
    last_name = null,
    deleted = true,
    guest_created_by = null
  where
    u.id = ip_guest_id and
    u.guest = true;

end;
$$
language plpgsql;
