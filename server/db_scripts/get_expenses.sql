if object_id ('get_expenses') is not null
  drop procedure get_expenses
go
create procedure get_expenses
  @event_id int
as
begin

  select ex.* from expense ex
    inner join category c on c.id = ex.category_id
    inner join [event] ev on ev.id = c.event_id
  where ev.id = @event_id

end