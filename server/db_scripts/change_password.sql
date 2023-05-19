if object_id ('change_password') is not null
  drop procedure change_password
go
create procedure change_password
  @user_id int,
  @password nvarchar(255)
as
begin

  update [user] set [password] = @password where id = @user_id
  
  select id, username, email, created from [user] where id = @user_id

end
go
