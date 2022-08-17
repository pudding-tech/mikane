if object_id ('rename_category') is not null
  drop procedure rename_category
go
create procedure rename_category
  @category_id int,
  @name nvarchar(255)
as
begin

  update category set [name] = @name where id = @category_id
  
  select * from category where event_id = (
    select event_id from category where id = @category_id
  )

end