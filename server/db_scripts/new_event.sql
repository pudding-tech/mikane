if object_id ('new_event') is not null
  drop procedure new_event
go
create procedure new_event
  @name nvarchar(255)
as
begin

  insert into [event]([name], created) values (@name, GETDATE())

  select * from [event] where id = @@IDENTITY

end
go
