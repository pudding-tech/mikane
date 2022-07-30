if object_id ('get_categories') is not null
  drop procedure get_categories
go
create procedure get_categories
  @event_id int
as
begin

  select c.* from category c
    inner join [event] ev on ev.id = c.event_id
  where ev.id = @event_id

end