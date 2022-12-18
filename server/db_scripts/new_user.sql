if object_id ('new_user') is not null
  drop procedure new_user
go
create procedure new_user
  @username nvarchar(255),
  @email nvarchar(255),
  @password nvarchar(255)
as
begin

  insert into [user](username, email, [password], created) values (@username, @email, @password, GETDATE())

  declare @user_id int = @@IDENTITY
  -- exec add_user_to_event @user_id, @event_id, 0

  select id, username, email, created from [user] where id = @user_id

end
go
