if object_id ('rename_category') is not null
  drop procedure rename_category
go
create procedure rename_category
  @category_uuid uniqueidentifier,
  @name nvarchar(255)
as
begin

  if not exists (select 1 from category where uuid = @category_uuid)
  begin
    throw 50007, 'Category not found', 1
  end

  update category set [name] = @name where uuid = @category_uuid
  
  exec get_categories null, @category_uuid

end
go
