if object_id ('new_user_in_event') is not null
  drop procedure new_user_in_event
go
create procedure new_user_in_event
  @event_id int,
  @user_id int
as
begin

  insert into event_user (event_id, user_id) values (@event_id, @user_id)

  select * from event_user where event_id = @event_id and user_id = @user_id

end