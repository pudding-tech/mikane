if object_id ('delete_user') is not null
  drop procedure delete_user
go
create procedure delete_user
  @user_id int
as
begin

  if not exists (select 1 from [user] where id = @user_id)
  begin
    throw 50008, 'User not found', 1
  end

  delete from [user] where id = @user_id

end
go
