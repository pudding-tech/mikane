if object_id ('add_user_to_category') is not null
  drop procedure add_user_to_category
go
create procedure add_user_to_category
  @category_id int,
  @user_id int,
  @weight numeric(14)
as
begin

  declare @event_id int
  declare @weighted bit

  select @event_id = event_id, @weighted = weighted from category where id = @category_id

  if not exists (select user_id from user_event where event_id = @event_id and user_id = @user_id)
  begin
    throw 51010, 'User not in event, cannot be added to category', 1
  end

  if exists (select user_id from user_category where category_id = @category_id and user_id = @user_id)
  begin
    throw 51010, 'User is already in this category', 1
  end

  if (@weighted = 1 and @weight is null)
    begin;
      throw 51010, 'Weight required when adding user to weighted category', 1
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
