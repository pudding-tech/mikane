if object_id ('new_event') is not null
  drop procedure new_event
go
create procedure new_event
  @name nvarchar(255),
  @user_id int,
  @private bit
as
begin

  insert into [event]([name], created, admin_id, [private]) values (@name, GETDATE(), @user_id, @private)

  declare @event_id int = @@IDENTITY
  exec get_events @event_id

end
go
