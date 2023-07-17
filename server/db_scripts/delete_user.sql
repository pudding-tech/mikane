drop function if exists delete_user;
create or replace function delete_user(
  ip_user_id uuid
)
returns void as
$$
begin

  if not exists (select 1 from "user" u where u.id = ip_user_id) then
    raise exception 'User not found' using errcode = 'P0008';
  end if;

  delete from "user" u where u.id = ip_user_id;

end;
$$
language plpgsql;
