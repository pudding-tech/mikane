if object_id ('new_user') is not null
  drop procedure new_user
go
create procedure new_user
  @name nvarchar(255),
  @event_id int
as
begin

  insert into [user](name, created, event_id) values (@name, GETDATE(), @event_id)

  select * from [user] where id = @@IDENTITY

end