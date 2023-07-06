if object_id ('delete_expense') is not null
  drop procedure delete_expense
go
create procedure delete_expense
  @expense_uuid uniqueidentifier,
  @user_uuid uniqueidentifier
as
begin

  declare @expense_id int
  declare @user_id int
  select @expense_id = id from expense where uuid = @expense_uuid
  select @user_id = id from [user] where uuid = @user_uuid

  if not exists (select 1 from expense where id = @expense_id)
  begin
    throw 50084, 'Expense not found', 1
  end

  if not exists (select 1 from expense ex
                    inner join category c on c.id = ex.category_id
                    inner join [event] ev on ev.id = c.event_id
                    inner join user_event ue on ue.event_id = ev.id
                  where ex.id = @expense_id and
                        ue.user_id = @user_id and
                        (ex.payer_id = @user_id or ue.admin = 1))
  begin
    throw 50086, 'You can only delete your own expenses (unless event admin)', 1
  end

  delete from expense where id = @expense_id

end
go
