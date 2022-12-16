if object_id ('get_users') is not null
  drop procedure get_users
go
create procedure get_users
  @event_id int
as
begin

  if (@event_id is null)
    begin
        
      select id, [name], email, created from
        [user]
      order by
        id
      
    end
  else
    begin
        
      select u.id, u.[name], u.email, u.created, ue.admin, ue.joined_date from
        [user] u
        inner join user_event ue on ue.user_id = u.id
      where
        ue.event_id = @event_id
      order by
        u.id

    end

end
go
