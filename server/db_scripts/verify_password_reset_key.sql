if object_id ('verify_password_reset_key') is not null
  drop procedure verify_password_reset_key
go
create procedure verify_password_reset_key
  @key nvarchar(255)
as
begin

  select 1
  from
    password_reset_key
  where
    [key] = @key and
    used = 0 and
    expires > GETDATE()

end
go
