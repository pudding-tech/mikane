if object_id ('get_user_hash') is not null
  drop procedure get_user_hash
go
create procedure get_user_hash
  @usernameEmail nvarchar(255),
  @user_uuid uniqueidentifier
as
begin

  if (@user_uuid is not null)
    begin
      select
        uuid, [password]
      from
        [user]
      where
        uuid = @user_uuid
    end
  else
    begin
      select
        uuid, [password]
      from
        [user]
      where
        username = @usernameEmail or
        email = @usernameEmail
    end

end
go
