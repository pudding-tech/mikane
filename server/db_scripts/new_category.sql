if object_id ('new_category') is not null
  drop procedure new_category
go
create procedure new_category
  @event_id int,
  @name nvarchar(255)
as
begin

  insert into category(event_id, [name]) values (@event_id, @name)

  select * from category where event_id = @event_id

end