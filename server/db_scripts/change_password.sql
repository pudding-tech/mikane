if object_id ('change_password') is not null
  drop procedure change_password
go
create procedure change_password
  @user_uuid uniqueidentifier,
  @password nvarchar(255)
as
begin

  update [user] set [password] = @password where uuid = @user_uuid
  
  select uuid, username, email, created from [user] where uuid = @user_uuid

end
go
