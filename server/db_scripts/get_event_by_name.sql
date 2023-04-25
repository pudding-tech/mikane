if object_id ('get_event_by_name') is not null
  drop procedure get_event_by_name
go
create procedure get_event_by_name
  @event_name nvarchar(254),
  @user_id int
as
begin

  if (@user_id is null)
    begin
      select
        id, [name], [description], created, admin_id, [private], uuid
      from
        [event]
      where
        [name] = @event_name
    end

  else
    begin
      declare @TRUE bit = 1
      declare @FALSE bit = 0

      select
        e.id, e.name, e.description, e.created, e.admin_id, e.private, e.uuid,
        @user_id as 'user_id',
        case
          when exists (select * from user_event ue where e.id = ue.event_id and ue.user_id = @user_id)
            then @TRUE
            else @FALSE
          end as 'in_event',
        case
          when e.admin_id = @user_id
            then @TRUE
            else @FALSE
          end as 'is_admin'
      from
        [event] e
      where
        e.name = @event_name
    end

end
go
