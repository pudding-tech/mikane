if object_id ('rename_category') is not null
  drop procedure rename_category
go
create procedure rename_category
  @category_id int,
  @name nvarchar(255)
as
begin

  if not exists (select 1 from category where id = @category_id)
  begin
    throw 50007, 'Category not found', 1
  end

  update category set [name] = @name where id = @category_id
  
  select * from category where event_id = (
    select event_id from category where id = @category_id
  )

end
go
