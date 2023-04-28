if object_id ('get_api_keys') is not null
  drop procedure get_api_keys
go
create procedure get_api_keys
as
begin

  select
    api_key_id, [name], hashed_key, valid_from, valid_to
  from
    api_key

end
go
