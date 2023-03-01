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

  exec get_expenses null, null, @@IDENTITY

end
go
