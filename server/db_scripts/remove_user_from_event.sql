if object_id ('remove_user_from_event') is not null
  drop procedure remove_user_from_event
go
create procedure remove_user_from_event
  @event_id int,
  @user_id int
as
begin

  delete from user_event where event_id = @event_id and user_id = @user_id

  exec get_events @event_id

end
go
