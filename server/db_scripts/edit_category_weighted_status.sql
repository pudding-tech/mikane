if object_id ('edit_category_weighted_status') is not null
  drop procedure edit_category_weighted_status
go
create procedure edit_category_weighted_status
  @category_uuid uniqueidentifier,
  @weighted bit
as
begin

  declare @category_id int
  select @category_id = id from category where uuid = @category_uuid

  if not exists (select 1 from category where id = @category_id)
  begin
    throw 50007, 'Category not found', 1
  end

  update category set weighted = @weighted where id = @category_id

  declare @event_id int
  select @event_id = event_id from category where id = @category_id

  if (@weighted = 1)
  begin
    if exists (select * from user_category where category_id = @category_id and [weight] is null)
    begin
      update user_category set [weight] = 1 where category_id = @category_id and [weight] is null
    end
  end

  declare @event_uuid uniqueidentifier
  select @event_uuid = uuid from [event] where id = @event_id
  exec get_categories @event_uuid, @category_uuid

end
go
