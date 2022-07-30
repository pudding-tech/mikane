if object_id ('new_expense') is not null
  drop procedure new_expense
go
create procedure new_expense
  @name nvarchar(255),
  @description nvarchar(255),
  @category_id int,
  @user_id int
as
begin

  insert into expense([name], [description], category_id, user_id)
    values (@name, @description, @category_id, @user_id)

  select * from expense where category_id = @category_id

end