if object_id ('get_users') is not null
  drop procedure get_users
go
create procedure get_users
  @event_uuid uniqueidentifier,
  @exclude_user_uuid uniqueidentifier
as
begin

  declare @event_id int
  declare @exclude_user_id int
  select @event_id = id from [event] where uuid = @event_uuid
  select @exclude_user_id = id from [user] where uuid = @exclude_user_uuid

  if (@event_uuid is null)
    begin
        
      select
        uuid, username, first_name, last_name, email, phone_number, created
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
        u.uuid, u.username, u.first_name, u.last_name, u.email, u.phone_number, u.created,
        e.uuid as 'event_uuid', ue.admin as 'event_admin', ue.joined_date as 'event_joined_date'
      from
        [user] u
        inner join user_event ue on ue.user_id = u.id
        inner join [event] e on e.id = ue.event_id
      where
        ue.event_id = @event_id and
        ((IsNumeric(@exclude_user_id) = 1 and u.id != @exclude_user_id) or
        (IsNumeric(@exclude_user_id) = 0 and u.id = u.id))
      order by
        u.id

    end

end
go
