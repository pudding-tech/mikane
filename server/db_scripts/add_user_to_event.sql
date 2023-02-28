if object_id ('add_user_to_event') is not null
  drop procedure add_user_to_event
go
create procedure add_user_to_event
  @event_id int,
  @user_id int
as
begin

  insert into user_event (user_id, event_id, joined_date) values (@user_id, @event_id, GETDATE())

  exec get_events @event_id

end
go
