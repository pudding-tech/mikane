if object_id ('edit_user_weight') is not null
  drop procedure edit_user_weight
go
create procedure edit_user_weight
  @category_id int,
  @user_id int,
  @weight numeric(14)
as
begin

  update user_category
  set [weight] = @weight
  where user_id = @user_id
    and category_id = @category_id

  declare @event_id int
  select @event_id = event_id from category where id = @category_id

  exec get_categories @event_id, @category_id

end
go
