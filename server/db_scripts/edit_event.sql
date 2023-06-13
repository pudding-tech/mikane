if object_id ('edit_event') is not null
  drop procedure edit_event
go
create procedure edit_event
  @event_id int,
  @user_id int,
  @name nvarchar(255),
  @description nvarchar(400),
  @private bit
as
begin

  if not exists (select 1 from [event] where id = @event_id)
  begin
    throw 50006, 'Event not found', 1
  end

  if not exists (select 1 from [event] e
                  inner join user_event ue on e.id = ue.event_id
                  where e.id = @event_id and ue.user_id = @user_id and ue.admin = 1)
  begin
    throw 50087, 'Only event admins can edit event', 1
  end
  
  if exists (select id from [event] where [name] = @name and id != @event_id)
  begin
    throw 50005, 'Another event already has this name', 1
  end

  update
    [event]
  set
    [name] = isnull(@name, [name]),
    [description] = nullif(isnull(@description, [description]), ''),
    [private] = isnull(@private, [private])
  where
    id = @event_id

  if (@description = '')
  begin
    update [event] set [description] = null where id = @event_id
  end
  
  exec get_events @event_id, null

end
go
