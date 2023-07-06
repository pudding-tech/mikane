if object_id ('add_user_as_event_admin') is not null
  drop procedure add_user_as_event_admin
go
create procedure add_user_as_event_admin
  @event_uuid uniqueidentifier,
  @user_uuid uniqueidentifier,
  @by_user_uuid uniqueidentifier
as
begin

  declare @event_id int
  declare @user_id int
  declare @by_user_id int
  select @event_id = id from [event] where uuid = @event_uuid
  select @user_id = id from [user] where uuid = @user_uuid
  select @by_user_id = id from [user] where uuid = @by_user_uuid

  if not exists (select 1 from [event] where id = @event_id)
  begin
    throw 50006, 'Event not found', 1
  end

  if not exists (select 1 from [user] where id = @user_id)
  begin
    throw 50008, 'User not found', 1
  end

  if not exists (select 1 from [event] e
                  inner join user_event ue on e.id = ue.event_id
                  where e.id = @event_id and ue.user_id = @by_user_id and ue.admin = 1)
  begin
    throw 50087, 'Only event admins can edit event', 1
  end

  if not exists (select 1 from user_event where event_id = @event_id and user_id = @user_id)
  begin
    throw 50090, 'User not in event, thus cannot be added as event admin', 7
  end

  if exists (select 1 from user_event where event_id = @event_id and user_id = @user_id and [admin] = 1)
  begin
    throw 50091, 'User is already an admin for this event', 7
  end

  update user_event set [admin] = 1 where event_id = @event_id and user_id = @user_id

  exec get_events @event_uuid, null

end
go
