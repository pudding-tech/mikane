drop function if exists get_user_hash;
create or replace function get_user_hash(
  ip_username_email varchar(255),
  ip_user_uuid uuid
)
returns table (
  "uuid" uuid,
  "password" varchar(255)
) as
$$
begin
  if ip_user_uuid is not null then
    begin
      return query
      select
        u.uuid, u.password
      from
        "user" u
      where
        u.uuid = ip_user_uuid;
    end;
  else
    begin
      return query
      select
        u.uuid, u.password
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
