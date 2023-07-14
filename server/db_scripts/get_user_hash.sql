drop function if exists get_user_hash;
create or replace function get_user_hash(
  ip_username_email varchar(255),
  ip_user_id uuid
)
returns table (
  id uuid,
  "password" varchar(255)
) as
$$
begin
  if (ip_user_id is not null) then
    begin
      return query
      select
        u.id, u.password
      from
        "user" u
      where
        u.id = ip_user_id;
    end;
  else
    begin
      return query
      select
        u.id, u.password
      from
        "user" u
      where
        u.username = ip_username_email or
        u.email = ip_username_email;
    end;
  end if;
end;
$$
language plpgsql;
