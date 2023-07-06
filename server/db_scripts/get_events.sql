if object_id ('get_events') is not null
  drop procedure get_events
go
create procedure get_events
  @event_uuid uniqueidentifier,
  @user_uuid uniqueidentifier
as
begin

  declare @event_id int
  declare @user_id int
  select @event_id = id from [event] where uuid = @event_uuid
  select @user_id = id from [user] where uuid = @user_uuid

  if (@user_uuid is null)
    begin
      select
        e.uuid, e.name, e.description, e.created, e.private,
        (
          select 
            u.uuid as 'user_uuid'
          from user_event ue
            inner join [user] u on ue.user_id = u.id
          where
            ue.event_id = e.id and
            ue.admin = 1
          for json path
        ) as 'admin_ids'
      from
        [event] e
      where
        e.uuid = isnull(@event_uuid, e.uuid)
      order by e.id desc
    end

  else
    begin

      if not exists (select id from [user] where id = @user_id)
      begin
        throw 50008, 'User not found', 1
      end

      declare @TRUE bit = 1
      declare @FALSE bit = 0

      select
        e.uuid, e.name, e.description, e.created, e.private,
        (
          select 
            u.uuid as 'user_uuid'
          from user_event ue
            inner join [user] u on ue.user_id = u.id
          where
            ue.event_id = e.id and
            ue.admin = 1
          for json path
        ) as 'admin_ids',
        @user_uuid as 'user_uuid',
        case
          when exists (select ue.user_id where ue.user_id is not null)
            then @TRUE
            else @FALSE
          end as 'user_in_event',
        case
          when ue.admin = 1
            then @TRUE
            else @FALSE
          end as 'user_is_admin'
      from
        [event] e
        left join user_event ue on e.id = ue.event_id and ue.user_id = @user_id
      where
        e.uuid = isnull(@event_uuid, e.uuid)
      order by e.id desc
    end

end
go
