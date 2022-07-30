if object_id ('new_user') is not null
  drop procedure new_user
go
create procedure new_user
  @name nvarchar(255),
  @event_id int
as
begin

  insert into [user](name, created) values (@name, GETDATE())
  insert into event_user (event_id, user_id) values (@event_id, @@identity)

  select * from [user]

end