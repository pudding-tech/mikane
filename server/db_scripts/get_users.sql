if object_id ('get_users') is not null
  drop procedure get_users
go
create procedure get_users
  @event_id int,
  @exclude_user_id int
as
begin

  if (@event_id is null)
    begin
        
      select
        id, username, first_name, last_name, email, phone_number, created, uuid
      from
        [user]
      where
        (IsNumeric(@exclude_user_id) = 1 and id != @exclude_user_id) or
        (IsNumeric(@exclude_user_id) = 0 and id = id)
      order by
        id
      
    end
  else
    begin
        
      select
        u.id, u.username, u.first_name, u.last_name, u.email, u.phone_number, u.created, u.uuid,
        ue.event_id, ue.admin as 'event_admin', ue.joined_date as 'event_joined_date'
      from
        [user] u
        inner join user_event ue on ue.user_id = u.id
      where
        ue.event_id = @event_id and
        ((IsNumeric(@exclude_user_id) = 1 and u.id != @exclude_user_id) or
        (IsNumeric(@exclude_user_id) = 0 and u.id = u.id))
      order by
        u.id

    end

end
go
