if object_id ('delete_event') is not null
  drop procedure delete_event
go
create procedure delete_event
  @event_id int,
  @user_id int
as
begin

  if not exists (select 1 from [event] where id = @event_id)
  begin
    throw 50006, 'Event not found', 1
  end

  if not exists (select 1 from [event] where id = @event_id and admin_id = @user_id)
  begin
    throw 50085, 'Only event admin can delete event', 1
  end

  delete from [event] where id = @event_id

end
go
