if object_id ('get_user') is not null
  drop procedure get_user
go
create procedure get_user
  @username nvarchar(255)
as
begin

  select
    id, username, email, [password], created
  from
    [user]
  where
    username = @username

end
go
