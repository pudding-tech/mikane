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
        id, [name], [description], created, admin_id, [private], uuid
      from
        [event]
      where
        id = isnull(@event_id, id)
      order by id desc
    end

  else
    begin
      declare @TRUE bit = 1
      declare @FALSE bit = 0

      select
        e.id, e.name, e.description, e.created, e.admin_id, e.private, e.uuid,
        @user_id as 'user_id',
        case
          when exists (select * from user_event ue where e.id = ue.event_id and ue.user_id = @user_id)
            then @TRUE
            else @FALSE
          end as 'in_event',
        case
          when e.admin_id = @user_id
            then @TRUE
            else @FALSE
          end as 'is_admin'
      from
        [event] e
      where
        e.id = isnull(@event_id, e.id)
      order by e.id desc
    end

end
go
