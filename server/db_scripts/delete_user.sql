drop function if exists delete_user;
create or replace function delete_user(
  ip_user_id uuid,
  ip_key varchar(255)
)
returns void as
$$
begin

  if not exists (select 1 from "user" u where u.id = ip_user_id) then
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

  delete from "user" u where u.id = ip_user_id;
  update delete_account_key dak set used = true where dak."key" = ip_key;

end;
$$
language plpgsql;
