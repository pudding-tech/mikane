if object_id ('new_user') is not null
  drop procedure new_user
go
create procedure new_user
  @name nvarchar(255),
  @email nvarchar(255),
  @password nvarchar(255),
  @event_id int
as
begin

  insert into [user]([name], email, [password], created) values (@name, @email, @password, GETDATE())

  declare @user_id int = @@IDENTITY
  exec add_user_to_event @user_id, @event_id, 0

  select id, [name], email, created from [user] where id = @user_id

end
go
