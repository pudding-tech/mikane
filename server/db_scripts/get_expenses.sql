if object_id ('get_expenses') is not null
  drop procedure get_expenses
go
create procedure get_expenses
  @event_id int,
  @user_id int,
  @expense_id int
as
begin

  if (@event_id is not null and @user_id is null)
  begin
    select
      ex.*,
      c.name as category_name,
      u.first_name as payer_first_name, u.last_name as payer_last_name, u.username as payer_username, u.uuid as payer_uuid
    from
      expense ex
      inner join category c on c.id = ex.category_id
      inner join [event] ev on ev.id = c.event_id
      inner join [user] u on u.id = ex.payer_id
    where
      ev.id = @event_id
    order by
      ex.date_added desc
  end

  else if (@event_id is not null and @user_id is not null)
  begin
    select
      ex.*,
      c.name as category_name,
      u.first_name as payer_first_name, u.last_name as payer_last_name, u.username as payer_username, u.uuid as payer_uuid
    from
      expense ex
      inner join category c on c.id = ex.category_id
      inner join [event] ev on ev.id = c.event_id
      inner join [user] u on u.id = ex.payer_id
    where
      ev.id = @event_id and
      u.id = @user_id
    order by
      ex.date_added desc
  end

  else if (@expense_id is not null)
  begin
    select
      ex.*,
      c.name as category_name,
      u.first_name as payer_first_name, u.last_name as payer_last_name, u.username as payer_username, u.uuid as payer_uuid
    from
      expense ex
      inner join category c on c.id = ex.category_id
      inner join [event] ev on ev.id = c.event_id
      inner join [user] u on u.id = ex.payer_id
    where
      ex.id = @expense_id
    order by
      ex.date_added desc
  end

end
go
