if object_id ('new_user') is not null
  drop procedure new_user
go
create procedure new_user
  @username nvarchar(255),
  @first_name nvarchar(255),
  @last_name nvarchar(255),
  @email nvarchar(255),
  @phone_number nvarchar(20),
  @password nvarchar(255)
as
begin

  insert into [user](username, first_name, last_name, email, phone_number, [password], created) values (@username, @first_name, @last_name, @email, @phone_number, @password, GETDATE())

  declare @user_id int = @@IDENTITY
  exec get_user @user_id

end
go
