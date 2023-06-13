if object_id ('get_events') is not null
  drop procedure get_events
go
create procedure get_events
  @event_id int,
  @user_id int
as
begin

  if (@user_id is null)
    begin
      select
        e.id, e.name, e.description, e.created, e.private, e.uuid,
        (
          select 
            ue.user_id
          from 
            user_event ue
          where
            ue.event_id = e.id and
            ue.admin = 1
          for json path
        ) as 'admin_ids'
      from
        [event] e
      where
        e.id = isnull(@event_id, e.id)
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
        e.id, e.name, e.description, e.created, e.private, e.uuid,
        (
          select 
            ue.user_id
          from 
            user_event ue
          where
            ue.event_id = e.id and
            ue.admin = 1
          for json path
        ) as 'admin_ids',
        @user_id as 'user_id',
        case
          when exists (select ue.user_id where ue.user_id is not null)
            then @TRUE
            else @FALSE
          end as 'in_event',
        case
          when ue.admin = 1
            then @TRUE
            else @FALSE
          end as 'is_admin'
      from
        [event] e
        left join user_event ue on e.id = ue.event_id and ue.user_id = @user_id
      where
        e.id = isnull(@event_id, e.id)
      order by e.id desc
    end

end
go
