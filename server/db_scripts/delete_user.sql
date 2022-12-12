if object_id ('delete_user') is not null
  drop procedure delete_user
go
create procedure delete_user
  @user_id int
as
begin

  delete from [user] where id = @user_id

end
go
