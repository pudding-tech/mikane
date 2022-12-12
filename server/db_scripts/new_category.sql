if object_id ('new_category') is not null
  drop procedure new_category
go
create procedure new_category
  @event_id int,
  @name nvarchar(255),
  @weighted bit
as
begin

  insert into category(event_id, [name], weighted) values (@event_id, @name, @weighted)

  select * from category where id = @@IDENTITY

end
go
