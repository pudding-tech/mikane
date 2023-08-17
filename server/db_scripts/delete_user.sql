drop function if exists delete_user;
create or replace function delete_user(
  ip_user_id uuid,
  ip_key varchar(255)
)
returns void as
$$
declare
  tmp_event_id uuid;
begin

  if not exists (select 1 from "user" u where u.id = ip_user_id and u.deleted = false) then
    raise exception 'User not found' using errcode = 'P0008';
  end if;

  if not exists (select 1 from delete_account_key dak where
                  dak."key" = ip_key and
                  dak.user_id = ip_user_id and
                  dak.used = false and
                  dak.expires > CURRENT_TIMESTAMP)
  then
    raise exception 'This key is not valid for this user' using errcode = 'P0108';
  end if;

  -- Delete user from active events
  for tmp_event_id in select e.id from "event" e where e.active = true
  loop
    perform delete_user_from_event(ip_user_id, tmp_event_id);
  end loop;

  update
    "user" u
  set
    username = digest(u.username, 'sha256'),
    first_name = 'deleted',
    last_name = null,
    email = null,
    phone_number = null,
    "password" = '22',
    deleted = true
  where
    u.id = ip_user_id;

  update delete_account_key dak set used = true where dak."key" = ip_key;

end;
$$
language plpgsql;
