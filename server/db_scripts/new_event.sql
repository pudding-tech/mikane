if object_id ('new_event') is not null
  drop procedure new_event
go
create procedure new_event
  @name nvarchar(255),
  @description nvarchar(400),
  @user_uuid uniqueidentifier,
  @private bit,
  @active bit,
  @usernames_only bit
as
begin

  if exists (select 1 from [event] where [name] = @name)
  begin
    throw 50005, 'Another event already has this name', 1
  end

  if not exists (select 1 from [user] where uuid = @user_uuid)
  begin
    throw 50008, 'User not found', 1
  end

  insert into [event]([name], [description], created, [private], active, usernames_only) values (@name, @description, GETDATE(), @private, @active, @usernames_only)

  declare @event_uuid uniqueidentifier
  select @event_uuid = uuid from [event] where id = @@IDENTITY
  exec add_user_to_event @event_uuid, @user_uuid, 1

end
go
