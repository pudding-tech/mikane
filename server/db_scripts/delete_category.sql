if object_id ('delete_category') is not null
  drop procedure delete_category
go
create procedure delete_category
  @category_id int
as
begin

  delete from category where id = @category_id

end
go
