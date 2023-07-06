if object_id ('delete_user') is not null
  drop procedure delete_user
go
create procedure delete_user
  @user_uuid uniqueidentifier
as
begin

  if not exists (select 1 from [user] where uuid = @user_uuid)
  begin
    throw 50008, 'User not found', 1
  end

  delete from [user] where uuid = @user_uuid

end
go
