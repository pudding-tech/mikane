if object_id ('edit_user_weight') is not null
  drop procedure edit_user_weight
go
create procedure edit_user_weight
  @category_id int,
  @user_id int,
  @weight numeric(14)
as
begin

  update category_user
  set [weight] = @weight
  where category_id = @category_id
    and user_id = @user_id

  declare @event_id int

  select top 1
    @event_id = e.id
  from [event] e
    inner join category c on c.event_id = e.id
  where c.id = @category_id

  exec get_categories @event_id, @category_id

end