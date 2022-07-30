if object_id ('get_users') is not null
  drop procedure get_users
go
create procedure get_users
  @event_id int
as
begin

  if (@event_id is null)
    begin
        
      select * from [user]
      
    end
  else
    begin
        
      select *
      from [user] u
        inner join event_user eu on eu.user_id = u.id
      where eu.event_id = @event_id

    end

end