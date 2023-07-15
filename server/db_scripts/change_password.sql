drop function if exists change_password;
create or replace function change_password(
  ip_user_id uuid,
  ip_password varchar(255)
)
returns table (
  id uuid,
  username varchar(255),
  email varchar(255),
  created timestamp
) as
$$
begin

  update "user" u set u.password = ip_password where u.id = ip_user_id;

  return query
  select u.id, u.username, u.email, u.created from "user" u where u.id = ip_user_id;

end;
$$
language plpgsql;
