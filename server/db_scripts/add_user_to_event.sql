if object_id ('add_user_to_event') is not null
  drop procedure add_user_to_event
go
create procedure add_user_to_event
  @event_id int,
  @user_id int
as
begin

  insert into event_user (event_id, user_id) values (@event_id, @user_id)

  select * from [event] where id = @event_id

end