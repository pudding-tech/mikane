if object_id ('new_category') is not null
  drop procedure new_category
go
create procedure new_category
  @name nvarchar(255),
  @icon nvarchar(255),
  @weighted bit,
  @event_uuid uniqueidentifier
as
begin

  declare @event_id int
  select @event_id = id from [event] where uuid = @event_uuid

  if not exists (select 1 from [event] where id = @event_id)
  begin
    throw 50006, 'Event not found', 1
  end

  if exists (select 1 from [category] where [name] = @name and event_id = @event_id)
  begin
    throw 50097, 'Another category in this event already has this name', 1
  end

  insert into category(event_id, [name], icon, weighted) values (@event_id, @name, @icon, @weighted)

  declare @category_uuid uniqueidentifier
  select @category_uuid = uuid from category where id = @@IDENTITY

  exec get_categories null, @category_uuid

end
go
