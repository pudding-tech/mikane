drop function if exists get_users_name;
create or replace function get_users_name(
  ip_event_id uuid,
  ip_category_id uuid
)
returns table (
  id uuid,
  username varchar(255),
  first_name varchar(255),
  last_name varchar(255),
  guest boolean
) as
$$
begin
  
  if (ip_category_id is null) then
    return query
    select
      u.id, u.username, u.first_name, u.last_name, u.guest
    from
      "user" u
      inner join user_event ue on ue.user_id = u.id
    where
      ue.event_id = ip_event_id;
  else
    return query
    select
      u.id, u.username, u.first_name, u.last_name, u.guest
    from
      "user" u
      inner join user_event ue on ue.user_id = u.id
      inner join category c on c.event_id = ue.event_id
    where
      c.id = ip_category_id;
  end if;

end;
$$
language plpgsql;
