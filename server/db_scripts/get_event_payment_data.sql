if object_id ('get_event_payment_data') is not null
  drop procedure get_event_payment_data
go
create procedure get_event_payment_data
  @event_uuid uniqueidentifier
as
begin

  if (@event_uuid is null)
  begin
    return
  end

  execute get_users @event_uuid, null
  execute get_categories @event_uuid, null
  execute get_expenses @event_uuid, null, null

end
go
