if object_id ('get_expenses') is not null
  drop procedure get_expenses
go
create procedure get_expenses
  @event_uuid uniqueidentifier,
  @user_uuid uniqueidentifier,
  @expense_uuid uniqueidentifier
as
begin

  declare @event_id int
  declare @user_id int
  declare @expense_id int
  select @event_id = id from [event] where uuid = @event_uuid
  select @user_id = id from [user] where uuid = @user_uuid
  select @expense_id = id from expense where uuid = @expense_uuid

  if (@event_uuid is not null and @user_uuid is null)
  begin
    if not exists (select 1 from [event] where id = @event_id)
    begin
      throw 50006, 'Event not found', 1
    end

    select
      ex.uuid, ex.name, ex.description, ex.amount, ex.payer_id, ex.date_added,
      c.uuid as 'category_uuid', c.name as 'category_name', c.icon as 'category_icon',
      u.uuid as 'payer_uuid', u.first_name as 'payer_first_name', u.last_name as 'payer_last_name', u.username as 'payer_username'
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

  else if (@event_uuid is not null and @user_uuid is not null)
  begin
    if not exists (select 1 from [event] where id = @event_id)
    begin
      throw 50006, 'Event not found', 1
    end

    if not exists (select 1 from [user] where id = @user_id)
    begin
      throw 50008, 'User not found', 1
    end
    
    select
      ex.uuid, ex.name, ex.description, ex.amount, ex.payer_id, ex.date_added,
      c.uuid as 'category_uuid', c.name as 'category_name', c.icon as 'category_icon',
      u.uuid as 'payer_uuid', u.first_name as 'payer_first_name', u.last_name as 'payer_last_name', u.username as 'payer_username'
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

  else if (@expense_uuid is not null)
  begin
    if not exists (select 1 from expense where id = @expense_id)
    begin
      throw 50084, 'Expense not found', 1
    end

    select
      ex.uuid, ex.name, ex.description, ex.amount, ex.payer_id, ex.date_added,
      c.uuid as 'category_uuid', c.name as 'category_name', c.icon as 'category_icon',
      u.uuid as 'payer_uuid', u.first_name as 'payer_first_name', u.last_name as 'payer_last_name', u.username as 'payer_username'
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
