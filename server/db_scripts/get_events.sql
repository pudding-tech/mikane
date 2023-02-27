if object_id ('get_events') is not null
  drop procedure get_events
go
create procedure get_events
  @event_id int
as
begin

  if (@event_id is null)
    begin
      select
        id, [name], created, [private], uuid
      from
        [event]
      order by id desc
    end
  
  else
    begin
      select
        id, [name], created, [private], uuid
      from
        [event]
      where
        id = @event_id
      order by id desc
    end

end
go
