if object_id ('edit_category_weighted_status') is not null
  drop procedure edit_category_weighted_status
go
create procedure edit_category_weighted_status
  @category_id int,
  @weighted bit
as
begin

  declare @event_id int
  declare @currently_weighted bit

  select @currently_weighted = weighted from category where id = @category_id

  update category set weighted = @weighted where id = @category_id
  update category_user set [weight] = 1 where category_id = @category_id

  select top 1
    @event_id = e.id
  from [event] e
    inner join category c on c.event_id = e.id
  where c.id = @category_id

  exec get_categories @event_id, @category_id

end
go
