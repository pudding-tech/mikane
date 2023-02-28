if object_id ('get_event_payment_data') is not null
  drop procedure get_event_payment_data
go
create procedure get_event_payment_data
  @event_id int
as
begin

  if (@event_id is null)
  begin
    return
  end

  execute get_users @event_id
  execute get_categories @event_id, null
  execute get_expenses @event_id, null, null

end
go
