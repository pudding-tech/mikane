if object_id ('new_category') is not null
  drop procedure new_category
go
create procedure new_category
  @event_id int,
  @name nvarchar(255),
  @weighted bit
as
begin

  if not exists (select 1 from [event] where id = @event_id)
  begin
    throw 50006, 'Event not found', 1
  end

  insert into category(event_id, [name], weighted) values (@event_id, @name, @weighted)

  select * from category where id = @@IDENTITY

end
go
