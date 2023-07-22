drop function if exists get_users_name;
create or replace function get_users_name(
  ip_event_id uuid
)
returns table (
  id uuid,
  username varchar(255),
  first_name varchar(255),
  last_name varchar(255)
) as
$$
begin
  
  return query
  select
    u.id, u.username, u.first_name, u.last_name
  from
    "user" u
    inner join user_event ue on ue.user_id = u.id
  where
    ue.event_id = ip_event_id;
end;
$$
language plpgsql;
