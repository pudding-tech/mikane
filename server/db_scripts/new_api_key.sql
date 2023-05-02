if object_id ('new_api_key') is not null
  drop procedure new_api_key
go
create procedure new_api_key
  @uuid uniqueidentifier,
  @name nvarchar(255),
  @hashed_key nvarchar(255),
  @master bit,
  @valid_from datetime,
  @valid_to datetime
as
begin
  
  insert into api_key(api_key_id, [name], hashed_key, [master], valid_from, valid_to)
    values (@uuid, @name, @hashed_key, @master, @valid_from, @valid_to)

  select api_key_id, [name], hashed_key, [master], valid_from, valid_to from api_key where api_key_id = @uuid

end
go
