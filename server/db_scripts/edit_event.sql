if object_id ('edit_event') is not null
  drop procedure edit_event
go
create procedure edit_event
  @event_id int,
  @name nvarchar(255),
  @description nvarchar(400),
  @admin_id int,
  @private bit
as
begin

  if exists (select id from [event] where [name] = @name)
  begin
    throw 50005, 'Another event already has this name', 1
  end

  if (@admin_id is not null)
  begin
    if not exists (select id from [user] where id = @admin_id)
    begin
      throw 50008, 'User does not exist', 1
    end
  end

  update
    [event]
  set
    [name] = isnull(@name, [name]),
    [description] = isnull(@description, [description]),
    admin_id = isnull(@admin_id, admin_id),
    [private] = isnull(@private, [private])
  where
    id = @event_id

  if (@description = '')
  begin
    update [event] set [description] = null where id = @event_id
  end
  
  exec get_events @event_id

end
go
