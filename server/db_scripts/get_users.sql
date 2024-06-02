drop function if exists get_users;
create or replace function get_users(
  ip_event_id uuid,
  ip_exclude_user_id uuid,
  ip_deleted boolean
)
returns table (
  id uuid,
  username varchar(255),
  first_name varchar(255),
  last_name varchar(255),
  email varchar(255),
  phone_number varchar(20),
  created timestamp,
  guest boolean,
  guest_created_by uuid,
  super_admin boolean,
  deleted boolean,
  public_email boolean,
  public_phone boolean,
  event_id uuid,
  is_event_admin boolean,
  event_joined_time timestamp
) as
$$
begin

  if (ip_event_id is null) then
  begin
    return query
    select
      u.id, u.username, u.first_name, u.last_name, u.email, u.phone_number, u.created, u.guest, u.guest_created_by, u.super_admin, u.deleted,
      up.public_email, up.public_phone,
      null::uuid as event_id,
      null::boolean as is_event_admin,
      null::timestamp as event_joined_time
    from
      "user" u
      left join user_preferences up on u.id = up.user_id
    where
      ((ip_exclude_user_id is not null and u.id != ip_exclude_user_id) or
      (ip_exclude_user_id is null and u.id = u.id)) and
      u.deleted = coalesce(ip_deleted, u.deleted)
    order by
      u.first_name asc,
      u.last_name asc;
  end;

  else
  begin

    if not exists (select 1 from "event" e where e.id = ip_event_id) then
      raise exception 'Event not found' using errcode = 'P0006';
    end if;

    return query
    select
      u.id, u.username, u.first_name, u.last_name, u.email, u.phone_number, u.created, u.guest, u.guest_created_by, u.super_admin, u.deleted,
      up.public_email, up.public_phone,
      e.id as event_id, ue.admin as is_event_admin, ue.joined_time as event_joined_time
    from
      "user" u
      inner join user_event ue on ue.user_id = u.id
      inner join "event" e on e.id = ue.event_id
      left join user_preferences up on u.id = up.user_id
    where
      ue.event_id = ip_event_id and
      ((ip_exclude_user_id is not null and u.id != ip_exclude_user_id) or
      (ip_exclude_user_id is null and u.id = u.id)) and
      u.deleted = coalesce(ip_deleted, u.deleted)
    order by
      u.first_name asc,
      u.last_name asc;
  end;

  end if;

end;
$$
language plpgsql;
