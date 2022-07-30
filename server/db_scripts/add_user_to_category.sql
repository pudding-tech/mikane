if object_id ('add_user_to_category') is not null
  drop procedure add_user_to_category
go
create procedure add_user_to_category
  @category_id int,
  @user_id int,
  @weight numeric(14)
as
begin

  insert into category_user (category_id, user_id, [weight]) values (@category_id, @user_id, @weight)

  select * from category_user where category_id = @category_id
  
end