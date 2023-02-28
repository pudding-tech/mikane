if object_id ('edit_user') is not null
  drop procedure edit_user
go
create procedure edit_user
  @user_id int,
  @username nvarchar(255)
as
begin

  update [user] set username = @username where id = @user_id
  
  exec get_user @user_id

end
go
