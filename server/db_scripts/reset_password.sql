drop function if exists reset_password;
create or replace function reset_password(
  ip_key varchar(255),
  ip_password varchar(255)
)
returns table (
  id uuid,
  username varchar(255),
  email varchar(255),
  created timestamp
) as
$$
declare
  tmp_user_id uuid;
begin

  select prk.user_id into tmp_user_id from password_reset_key prk where prk."key" = ip_key;

  update "user" u set "password" = ip_password where u.id = tmp_user_id;
  update password_reset_key prk set used = true where prk."key" = ip_key;

  return query
  select u.id, u.username, u.email, u.created from "user" u where u.id = tmp_user_id;

end;
$$
language plpgsql;
