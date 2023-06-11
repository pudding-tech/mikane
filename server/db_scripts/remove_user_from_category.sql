if object_id ('remove_user_from_category') is not null
  drop procedure remove_user_from_category
go
create procedure remove_user_from_category
  @category_id int,
  @user_id int
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

  delete from user_category where category_id = @category_id and user_id = @user_id

  declare @event_id int

  select @event_id = event_id from category where id = @category_id

  exec get_categories @event_id, @category_id

end
go
