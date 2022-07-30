if object_id ('new_expense') is not null
  drop procedure new_expense
go
create procedure new_expense
  @name nvarchar(255),
  @description nvarchar(255),
  @amount numeric(16, 2),
  @category_id int,
  @payer_id int
as
begin
  print(@amount)
  insert into expense([name], [description], amount, category_id, payer_id)
    values (@name, @description, @amount, @category_id, @payer_id)

  select ex.* from expense ex
    inner join category c on c.id = ex.category_id
    inner join [event] ev on ev.id = c.event_id
  where c.id = @category_id

end