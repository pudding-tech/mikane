if object_id ('get_user') is not null
  drop procedure get_user
go
create procedure get_user
  @user_id int,
  @username nvarchar(255)
as
begin

  if (@user_id is not null)
  begin
    select
      id, username, first_name, last_name, email, phone_number, [password], created, uuid
    from
      [user]
    where
      id = @user_id
  end

  else if (@username is not null)
  begin
    select
      id, username, first_name, last_name, email, phone_number, [password], created, uuid
    from
      [user]
    where
      username = @username
  end

end
go
