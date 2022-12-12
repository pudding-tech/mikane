if object_id ('delete_event') is not null
  drop procedure delete_event
go
create procedure delete_event
  @event_id int
as
begin

  delete from [event] where id = @event_id

end
go
