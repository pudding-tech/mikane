if object_id ('get_user_hash') is not null
  drop procedure get_user_hash
go
create procedure get_user_hash
  @usernameEmail nvarchar(255),
  @user_id int
as
begin

  if (@user_id is not null)
    begin
      select
        id, [password]
      from
        [user]
      where
        id = @user_id
    end
  else
    begin
      select
        id, [password]
      from
        [user]
      where
        username = @usernameEmail or
        email = @usernameEmail
    end

end
go
