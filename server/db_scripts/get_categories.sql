if object_id ('get_categories') is not null
  drop procedure get_categories
go
create procedure get_categories
  @event_id int,
  @category_id int
as
begin

  if @event_id is not null and not exists (select 1 from [event] where id = @event_id)
  begin
    throw 50006, 'Event not found', 1
  end

  select
    uc.user_id,
    c.id as 'category_id',
    c.weighted,
    'weight' = case
      when c.weighted = 1 then uc.weight
      when c.weighted = 0 then 1 end
  into
    #weights_temp
  from user_category uc
    inner join category c on c.id = uc.category_id
  where
    c.id = isnull(@category_id, c.id) and
    c.event_id = isnull(@event_id, c.event_id)

  select
    c.id,
    c.name,
    c.icon,
    c.weighted,
    c.event_id,
    (
      select
        uc.user_id,
        u.username,
        u.first_name,
        u.last_name,
        uw.weight
      from
        user_category uc
        inner join [user] u on u.id = uc.user_id
        inner join #weights_temp uw
          on uw.user_id = uc.user_id and
              uw.category_id = uc.category_id
      where
        uc.category_id = c.id
      for json path
    ) as 'user_weights'
  from category c
    inner join [event] e on c.event_id = e.id
  where
    c.id = isnull(@category_id, c.id) and
    c.event_id = isnull(@event_id, c.event_id)

end
go
