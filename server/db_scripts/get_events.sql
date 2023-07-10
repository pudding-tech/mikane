drop function if exists get_events;
create or replace function get_events(
  ip_event_uuid uuid,
  ip_user_uuid uuid
)
returns table (
  "uuid" uuid,
  "name" varchar(255),
  "description" varchar(255),
  created timestamp,
  "private" boolean,
  admin_ids JSONB,
  user_uuid uuid,
  user_in_event boolean,
  user_is_admin boolean
) as
$$
declare
  tmp_user_id int;
begin
  
  select u.id into tmp_user_id from "user" u where u.uuid = ip_user_uuid;

  if (ip_user_uuid is null) then
    begin
      return query
      select
        e.uuid, e.name, e.description, e.created, e.private,
        (
          select
            JSONB_AGG(jsonb_build_object('user_uuid', u.uuid))
          from user_event ue
            inner join "user" u on ue.user_id = u.id
          where
            ue.event_id = e.id and
            ue.admin = true
        ) as admin_ids,
        null::uuid as user_uuid,
        null::boolean as user_in_event,
        null::boolean as user_is_admin
      from
        "event" e
      where
        e.uuid = coalesce(ip_event_uuid, e.uuid)
      order by e.id desc;
    end;

  else
    begin
      if not exists (select 1 from "user" u where u.id = tmp_user_id) then
        raise exception 'User not found' using errcode = 'P0008';
      end if;

      return query
      select
        e.uuid, e.name, e.description, e.created, e.private,
        (
          select
            JSONB_AGG(jsonb_build_object('user_uuid', u.uuid))
          from user_event ue
            inner join "user" u on ue.user_id = u.id
          where
            ue.event_id = e.id and
            ue.admin = true
        ) as admin_ids,
        ip_user_uuid as user_uuid,
        case
          when exists (select 1 where ue.user_id is not null)
            then true
            else false
          end as user_in_event,
        case
          when ue.admin = true
            then true
            else false
          end as user_is_admin
      from
        "event" e
        left join user_event ue on e.id = ue.event_id and ue.user_id = tmp_user_id
      where
        e.uuid = coalesce(ip_event_uuid, e.uuid)
      order by e.id desc;
    end;

  end if;

end;
$$
language plpgsql;
