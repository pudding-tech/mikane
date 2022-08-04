if object_id ('get_events') is not null
  drop procedure get_events
go
create procedure get_events
as
begin

  select * from [event] order by id desc

end