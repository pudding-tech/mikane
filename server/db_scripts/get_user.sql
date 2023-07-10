drop function if exists get_user;
create or replace function get_user(
  ip_user_uuid_value uuid,
  ip_username_value varchar(255)
)
returns table (
  "uuid" uuid,
  username varchar(255),
  first_name varchar(255),
  last_name varchar(255),
  email varchar(255),
  phone_number varchar(20),
  "password" varchar(255),
  created timestamp
) as
$$
begin
  if ip_user_uuid_value is not null then
    return query
    select
      u.uuid, u.username, u.first_name, u.last_name, u.email, u.phone_number, u.password, u.created
    from
      "user" u
    where
      u.uuid = ip_user_uuid_value;
  elsif ip_username_value is not null then
    return query
    select
      u.uuid, u.username, u.first_name, u.last_name, u.email, u.phone_number, u.password, u.created
    from
      "user" u
    where
      u.username = ip_username_value;
  end if;
end;
$$
language plpgsql;
