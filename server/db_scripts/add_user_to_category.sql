if object_id ('add_user_to_category') is not null
  drop procedure add_user_to_category
go
create procedure add_user_to_category
  @category_id int,
  @user_id int,
  @weight numeric(14)
as
begin

  declare @weighted bit
  declare @event_id int

  select @weighted = weighted from category where id = @category_id

  if (@weighted = 1 and @weight is null)
    begin;
      throw 51000, 'Weight required when adding user to weighted category', 1
    end
  else if (@weighted = 1)
    begin
      insert into user_category (user_id, category_id, [weight]) values (@user_id, @category_id, @weight)
    end
  else
    begin
      insert into user_category (user_id, category_id) values (@user_id, @category_id)
    end

  select @event_id = event_id from category where id = @category_id

  exec get_categories @event_id, @category_id

end
go
