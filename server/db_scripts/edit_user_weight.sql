if object_id ('edit_user_weight') is not null
  drop procedure edit_user_weight
go
create procedure edit_user_weight
  @category_uuid uniqueidentifier,
  @user_uuid uniqueidentifier,
  @weight numeric(14)
as
begin

  declare @category_id int
  declare @user_id int
  select @category_id = id from category where uuid = @category_uuid
  select @user_id = id from [user] where uuid = @user_uuid

  if not exists (select 1 from category where id = @category_id)
  begin
    throw 50007, 'Category not found', 1
  end

  update user_category
  set [weight] = @weight
  where user_id = @user_id
    and category_id = @category_id

  declare @event_uuid uniqueidentifier
  select
    @event_uuid = e.uuid
  from category c
    inner join [event] e on c.event_id = e.id
  where c.id = @category_id

  exec get_categories @event_uuid, @category_uuid

end
go
