if object_id ('add_user_to_event') is not null
  drop procedure add_user_to_event
go
create procedure add_user_to_event
  @user_id int,
  @event_id int,
  @admin bit
as
begin

  insert into user_event (user_id, event_id, [admin], joined_date) values (@user_id, @event_id, @admin, GETDATE())

  exec get_events @event_id

end
go
