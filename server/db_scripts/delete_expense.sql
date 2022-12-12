if object_id ('delete_expense') is not null
  drop procedure delete_expense
go
create procedure delete_expense
  @expense_id int
as
begin

  delete from expense where id = @expense_id

end
go
