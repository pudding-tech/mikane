if object_id ('edit_user') is not null
  drop procedure edit_user
go
create procedure edit_user
  @user_uuid uniqueidentifier,
  @username nvarchar(255),
  @first_name nvarchar(255),
  @last_name nvarchar(255),
  @email nvarchar(255),
  @phone_number nvarchar(20)
as
begin

  if @username is not null and exists (select id from [user] where [username] = @username and uuid != @user_uuid) 
  begin
    throw 50017, 'Username already taken', 1
  end

  if @email is not null and exists (select id from [user] where email = @email and uuid != @user_uuid) 
  begin
    throw 50018, 'Email address already taken', 1
  end

  if @phone_number is not null and exists (select id from [user] where phone_number = @phone_number and uuid != @user_uuid)
  begin
    throw 50019, 'Phone number already taken', 1
  end

  update
    [user]
  set
    username = isnull(@username, username),
    first_name = isnull(@first_name, first_name),
    last_name = nullif(isnull(@last_name, last_name), ''),
    email = isnull(@email, email),
    phone_number = isnull(@phone_number, phone_number)
  where
    uuid = @user_uuid
  
  exec get_user @user_uuid, null

end
go
