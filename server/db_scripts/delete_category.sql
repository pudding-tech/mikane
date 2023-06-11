if object_id ('delete_category') is not null
  drop procedure delete_category
go
create procedure delete_category
  @category_id int
as
begin

  if not exists (select 1 from category where id = @category_id)
  begin
    throw 50007, 'Category not found', 1
  end

  delete from category where id = @category_id

end
go
