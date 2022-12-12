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
  
  set @description = isnull(@description, '')

  insert into expense([name], [description], amount, category_id, payer_id, date_added)
    values (@name, @description, @amount, @category_id, @payer_id, GETDATE())

  select ex.*, c.name as category_name, u.name as payer from expense ex
    inner join category c on c.id = ex.category_id
    inner join [user] u on u.id = ex.payer_id
  where ex.id = @@IDENTITY

end
go
