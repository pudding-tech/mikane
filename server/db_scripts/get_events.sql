if object_id ('get_events') is not null
  drop procedure get_events
go
create procedure get_events
  @name nvarchar(255)
as
begin

  if (@name is null)
    begin
      select * from [event]
    end
  else
    begin
      select * from [event] where name = @name
    end

end