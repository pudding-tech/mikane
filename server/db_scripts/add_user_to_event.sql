if object_id ('add_user_to_event') is not null
  drop procedure add_user_to_event
go
create procedure add_user_to_event
  @event_id int,
  @user_id int
as
begin

  if not exists (select id from [event] where id = @event_id)
  begin
    throw 50006, 'Event does not exist', 1
  end

  if not exists (select id from [user] where id = @user_id)
  begin
    throw 50008, 'User does not exist', 1
  end

  if exists (select user_id from user_event where event_id = @event_id and user_id = @user_id)
  begin
    throw 50009, 'User is already in this event', 7
  end

  insert into user_event (user_id, event_id, joined_date) values (@user_id, @event_id, GETDATE())

  exec get_events @event_id, null

end
go
