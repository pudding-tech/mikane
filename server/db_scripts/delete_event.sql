if object_id ('delete_event') is not null
  drop procedure delete_event
go
create procedure delete_event
  @event_uuid uniqueidentifier,
  @user_uuid uniqueidentifier
as
begin

  declare @event_id int
  declare @user_id int
  select @event_id = id from [event] where uuid = @event_uuid
  select @user_id = id from [user] where uuid = @user_uuid

  if not exists (select 1 from [event] where id = @event_id)
  begin
    throw 50006, 'Event not found', 1
  end

  if not exists (select 1 from [event] e
                  inner join user_event ue on e.id = ue.event_id
                  where e.id = @event_id and ue.user_id = @user_id and ue.admin = 1)
  begin
    throw 50085, 'Only event admins can delete event', 1
  end

  delete from [event] where id = @event_id

end
go
