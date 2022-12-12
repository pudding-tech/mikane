if object_id ('get_users') is not null
  drop procedure get_users
go
create procedure get_users
  @event_id int
as
begin

  if (@event_id is null)
    begin
        
      select * from
        [user]
      order by
        id
      
    end
  else
    begin
        
      select * from
        [user]
      where
        event_id = @event_id
      order by
        id

    end

end
go
