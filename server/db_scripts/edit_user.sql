if object_id ('edit_user') is not null
  drop procedure edit_user
go
create procedure edit_user
  @user_id int,
  @name nvarchar(255)
as
begin

  update [user] set [name] = @name where id = @user_id
  
  select * from [user] where id = @user_id

end
go
