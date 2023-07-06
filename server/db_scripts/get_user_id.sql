if object_id ('get_user_id') is not null
  drop procedure get_user_id
go
create procedure get_user_id
  @email nvarchar(255)
as
begin

  select
    uuid
  from
    [user]
  where
    email = @email

end
go
