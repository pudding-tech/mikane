if object_id ('get_expenses') is not null
  drop procedure get_expenses
go
create procedure get_expenses
  @event_id int
as
begin

  select ex.*, c.name as category_name, u.name as payer from expense ex
    inner join category c on c.id = ex.category_id
    inner join [event] ev on ev.id = c.event_id
    inner join [user] u on u.id = ex.payer_id
  where
    ev.id = @event_id
  order by ex.date_added desc

end