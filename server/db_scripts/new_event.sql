if object_id ('new_event') is not null
  drop procedure new_event
go
create procedure new_event
  @name nvarchar(255),
  @description nvarchar(400),
  @user_id int,
  @private bit,
  @active bit,
  @usernames_only bit
as
begin

  if exists (select id from [event] where [name] = @name)
  begin
    throw 50005, 'Another event already has this name', 1
  end

  if not exists (select id from [user] where id = @user_id)
  begin
    throw 50008, 'User not found', 1
  end

  insert into [event]([name], [description], created, admin_id, [private], active, usernames_only) values (@name, @description, GETDATE(), @user_id, @private, @active, @usernames_only)

  declare @event_id int = @@IDENTITY
  exec add_user_to_event @event_id, @user_id

end
go
