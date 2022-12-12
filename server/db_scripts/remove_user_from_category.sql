if object_id ('remove_user_from_category') is not null
  drop procedure remove_user_from_category
go
create procedure remove_user_from_category
  @category_id int,
  @user_id int
as
begin

  delete from category_user where category_id = @category_id and user_id = @user_id

  declare @event_id int

  select top 1
    @event_id = e.id
  from [event] e
    inner join category c on c.event_id = e.id
  where c.id = @category_id

  exec get_categories @event_id, @category_id

end
go
