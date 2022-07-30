if object_id ('new_event') is not null
  drop procedure new_event
go
create procedure new_event
  @name nvarchar(255)
as
begin

  insert into [event]([name]) values (@name)

  select * from [event]

end