if object_id ('new_category') is not null
  drop procedure new_category
go
create procedure new_category
  @name nvarchar(255),
  @icon nvarchar(255),
  @weighted bit,
  @event_id int
as
begin

  if not exists (select 1 from [event] where id = @event_id)
  begin
    throw 50006, 'Event not found', 1
  end

  if exists (select 1 from [category] where [name] = @name and event_id = @event_id)
  begin
    throw 50097, 'Another category in this event already has this name', 1
  end

  insert into category(event_id, [name], icon, weighted) values (@event_id, @name, @icon, @weighted)

  select * from category where id = @@IDENTITY

end
go
