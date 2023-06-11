if object_id ('add_user_to_category') is not null
  drop procedure add_user_to_category
go
create procedure add_user_to_category
  @category_id int,
  @user_id int,
  @weight numeric(14)
as
begin

  if not exists (select id from category where id = @category_id)
  begin
    throw 50007, 'Category not found', 1
  end

  if not exists (select id from [user] where id = @user_id)
  begin
    throw 50008, 'User not found', 1
  end

  declare @event_id int
  declare @weighted bit

  select @event_id = event_id, @weighted = weighted from category where id = @category_id

  if not exists (select user_id from user_event where event_id = @event_id and user_id = @user_id)
  begin
    throw 50010, 'User not in event, cannot be added to category', 7
  end

  if exists (select user_id from user_category where category_id = @category_id and user_id = @user_id)
  begin
    throw 50011, 'User is already in this category', 8
  end

  if (@weighted = 1 and @weight is null)
    begin;
      throw 50012, 'Weight required when adding user to weighted category', 9
    end
  else if (@weighted = 1)
    begin
      insert into user_category (user_id, category_id, [weight]) values (@user_id, @category_id, @weight)
    end
  else
    begin
      insert into user_category (user_id, category_id) values (@user_id, @category_id)
    end

  exec get_categories @event_id, @category_id

end
go
