if object_id ('add_user_as_event_admin') is not null
  drop procedure add_user_as_event_admin
go
create procedure add_user_as_event_admin
  @event_id int,
  @user_id int,
  @by_user_id int
as
begin

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

  exec get_events @event_id, null

end
go
