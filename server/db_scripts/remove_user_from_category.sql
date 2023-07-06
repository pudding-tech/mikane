if object_id ('remove_user_from_category') is not null
  drop procedure remove_user_from_category
go
create procedure remove_user_from_category
  @category_uuid uniqueidentifier,
  @user_uuid uniqueidentifier
as
begin

  declare @category_id int
  declare @user_id int
  select @category_id = id from category where uuid = @category_uuid
  select @user_id = id from [user] where uuid = @user_uuid

  if not exists (select id from category where id = @category_id)
  begin
    throw 50007, 'Category not found', 1
  end

  if not exists (select id from [user] where id = @user_id)
  begin
    throw 50008, 'User not found', 1
  end

  delete from user_category where category_id = @category_id and user_id = @user_id

  declare @event_uuid uniqueidentifier
  select
    @event_uuid = e.uuid
  from category c
    inner join [event] e on c.event_id = e.id
  where c.id = @category_id

  exec get_categories @event_uuid, @category_uuid

end
go
