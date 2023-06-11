if object_id ('remove_user_from_event') is not null
  drop procedure remove_user_from_event
go
create procedure remove_user_from_event
  @event_id int,
  @user_id int
as
begin

  if not exists (select id from [event] where id = @event_id)
  begin
    throw 50006, 'Event not found', 1
  end

  if not exists (select id from [user] where id = @user_id)
  begin
    throw 50008, 'User not found', 1
  end

  delete from user_event where event_id = @event_id and user_id = @user_id

  -- Delete expenses belonging to user from event
  delete e from expense e
    inner join category c on e.category_id = c.id
  where
    c.event_id = @event_id and
    e.payer_id = @user_id

  exec get_events @event_id, null

end
go
