if object_id ('get_user_hash') is not null
  drop procedure get_user_hash
go
create procedure get_user_hash
  @usernameEmail nvarchar(255)
as
begin

  select
    id, [password]
  from
    [user]
  where
    username = @usernameEmail or
    email = @usernameEmail

end
go
