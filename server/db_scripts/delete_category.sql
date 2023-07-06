if object_id ('delete_category') is not null
  drop procedure delete_category
go
create procedure delete_category
  @category_uuid uniqueidentifier
as
begin

  if not exists (select 1 from category where uuid = @category_uuid)
  begin
    throw 50007, 'Category not found', 1
  end

  delete from category where uuid = @category_uuid

end
go
