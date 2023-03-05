if object_id ('edit_category_weighted_status') is not null
  drop procedure edit_category_weighted_status
go
create procedure edit_category_weighted_status
  @category_id int,
  @weighted bit
as
begin

  update category set weighted = @weighted where id = @category_id
  --update user_category set [weight] = 1 where category_id = @category_id

  declare @event_id int
  select @event_id = event_id from category where id = @category_id

  exec get_categories @event_id, @category_id

end
go
