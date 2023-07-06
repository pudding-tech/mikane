if object_id ('add_user_to_event') is not null
  drop procedure add_user_to_event
go
create procedure add_user_to_event
  @event_uuid uniqueidentifier,
  @user_uuid uniqueidentifier,
  @admin bit
as
begin

  declare @event_id int
  declare @user_id int
  select @event_id = id from [event] where uuid = @event_uuid
  select @user_id = id from [user] where uuid = @user_uuid

  if not exists (select id from [event] where id = @event_id)
  begin
    throw 50006, 'Event not found', 1
  end

  if not exists (select id from [user] where id = @user_id)
  begin
    throw 50008, 'User not found', 1
  end

  if exists (select user_id from user_event where event_id = @event_id and user_id = @user_id)
  begin
    throw 50009, 'User is already in this event', 7
  end

  insert into user_event (user_id, event_id, joined_date, [admin]) values (@user_id, @event_id, GETDATE(), @admin)

  exec get_events @event_uuid, null

end
go
