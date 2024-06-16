drop function if exists get_events_for_user;
create or replace function get_events_for_user(
  ip_user_id uuid,
  ip_by_user_id uuid
)
returns table (
  id uuid,
  "name" varchar(255),
  "description" varchar(255),
  created timestamp,
  "private" boolean,
  status int,
  status_name varchar(255),
  admin_ids jsonb,
  user_id uuid,
  user_in_event boolean,
  user_is_admin boolean
) as
$$
begin

      if not exists (select 1 from "user" u where u.id = ip_user_id and u.deleted = false) then
        raise exception 'User not found' using errcode = 'P0008';
      end if;

      return query
      select
        e.id, e.name, e.description, e.created, e.private, e.status, est.name,
        (
          select
            JSONB_AGG(jsonb_build_object('user_id', u.id))
          from user_event ue
            inner join "user" u on ue.user_id = u.id
          where
            ue.event_id = e.id and
            ue.admin = true
        ) as admin_ids,
        ip_by_user_id as user_id,
        case
          when exists (select 1 where ue2.user_id is not null)
            then true
            else false
          end as user_in_event,
        case
          when ue2.admin = true
            then true
            else false
          end as user_is_admin
      from
        "event" e
        inner join event_status_type est on e.status = est.id
        inner join user_event ue on e.id = ue.event_id and ue.user_id = ip_user_id
        left join user_event ue2 on e.id = ue2.event_id and ue2.user_id = ip_by_user_id
      where
        (e.private = false or (e.private = true and ue2.user_id = ip_by_user_id))
      order by
        e.created desc;

end;
$$
language plpgsql;
