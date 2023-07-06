if object_id ('reset_password') is not null
  drop procedure reset_password
go
create procedure reset_password
  @key nvarchar(255),
  @password nvarchar(255)
as
begin

  declare @user_id int
  select @user_id = user_id from password_reset_key where [key] = @key

  update [user] set [password] = @password where id = @user_id
  update password_reset_key set used = 1 where [key] = @key

  select uuid, username, email, created from [user] where id = @user_id

end
go
