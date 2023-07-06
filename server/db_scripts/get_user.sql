if object_id ('get_user') is not null
  drop procedure get_user
go
create procedure get_user
  @user_uuid uniqueidentifier,
  @username nvarchar(255)
as
begin

  if (@user_uuid is not null)
  begin
    select
      uuid, username, first_name, last_name, email, phone_number, [password], created
    from
      [user]
    where
      uuid = @user_uuid
  end

  else if (@username is not null)
  begin
    select
      uuid, username, first_name, last_name, email, phone_number, [password], created
    from
      [user]
    where
      username = @username
  end

end
go
