if object_id ('edit_category_weighted_status') is not null
  drop procedure edit_category_weighted_status
go
create procedure edit_category_weighted_status
  @category_id int,
  @weighted bit
as
begin

  declare @event_id int
  declare @weight numeric(14)
  declare @currently_weighted bit

  select @currently_weighted = weighted from category where id = @category_id

  if (@weighted = 1 and @currently_weighted = 1)
    begin
      return
    end

  if (@weighted = 0)
    begin
      set @weight = null
    end
  else
    begin
      set @weight = 1
    end

  update category set weighted = @weighted

  update category_user
  set [weight] = @weight
  where category_id = @category_id

  select top 1
    @event_id = e.id
  from [event] e
    inner join category c on c.event_id = e.id
  where c.id = @category_id

  exec get_categories @event_id, @category_id

end