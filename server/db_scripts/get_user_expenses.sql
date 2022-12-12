if object_id ('get_user_expenses') is not null
  drop procedure get_user_expenses
go
create procedure get_user_expenses
  @user_id int
as
begin

  select ex.*, c.name as category_name, u.name as payer from expense ex
    inner join category c on c.id = ex.category_id
    inner join [event] ev on ev.id = c.event_id
    inner join [user] u on u.id = ex.payer_id
  where u.id = @user_id

end
go
