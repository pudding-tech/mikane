if object_id ('delete_expense') is not null
  drop procedure delete_expense
go
create procedure delete_expense
  @expense_id int,
  @user_id int
as
begin

  if not exists (select 1 from expense where id = @expense_id)
  begin
    throw 50084, 'Expense not found', 1
  end

  if not exists (select 1 from expense ex
                    inner join category c on c.id = ex.category_id
                    inner join [event] ev on ev.id = c.event_id
                  where ex.id = @expense_id and
                        (ex.payer_id = @user_id or ev.admin_id = @user_id))
  begin
    throw 50086, 'You can only delete your own expenses (unless event admin)', 1
  end

  delete from expense where id = @expense_id

end
go
