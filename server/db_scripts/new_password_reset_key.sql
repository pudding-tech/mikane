if object_id ('new_password_reset_key') is not null
  drop procedure new_password_reset_key
go
create procedure new_password_reset_key
  @user_uuid uniqueidentifier,
  @key nvarchar(255)
as
begin

  declare @user_id int
  select @user_id = id from [user] where uuid = @user_uuid

  insert into password_reset_key([key], user_id, used, expires)
    values (@key, @user_id, 0, DATEADD(hour, 1, GETDATE()))

end
go
