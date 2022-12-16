if object_id ('new_user') is not null
  drop procedure new_user
go
create procedure new_user
  @name nvarchar(255),
  @email nvarchar(255),
  @password nvarchar(255)
as
begin

  insert into [user]([name], email, [password], created) values (@name, @email, @password, GETDATE())

  select id, [name], email, created from [user] where id = @@IDENTITY

end
go
