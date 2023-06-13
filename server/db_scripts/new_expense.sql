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

  if not exists (select 1 from category where id = @category_id)
  begin
    throw 50007, 'Category not found', 1
  end

  if not exists (select 1 from [user] where id = @payer_id)
  begin
    throw 50008, 'User not found', 1
  end
  
  if not exists (select ue.user_id from user_event ue inner join category c on ue.event_id = c.event_id where c.id = @category_id and ue.user_id = @payer_id)
  begin
    throw 50062, 'User cannot pay for expense as user is not in event', 7
  end

  insert into expense([name], [description], amount, category_id, payer_id, date_added)
    values (@name, nullif(@description, ''), @amount, @category_id, @payer_id, GETDATE())

  exec get_expenses null, null, @@IDENTITY

end
go
