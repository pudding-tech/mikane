if object_id ('get_categories') is not null
  drop procedure get_categories
go
create procedure get_categories
  @event_id int,
  @category_id int
as
begin

  select
    c.id,
    c.name,
    c.weighted,
    c.event_id,
    e.use_real_names
  from category c
    inner join [event] e on c.event_id = e.id
  where
    c.id = isnull(@category_id, c.id) and
    c.event_id = isnull(@event_id, c.event_id)

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

  select
    uc.category_id,
    uc.user_id,
    u.username,
    u.first_name,
    u.last_name,
    uw.weight
  from
    user_category uc
    inner join [user] u on u.id = uc.user_id
    inner join category c on c.id = uc.category_id
    inner join #weights_temp uw
      on uw.user_id = uc.user_id and
          uw.category_id = c.id
  where
    c.id = isnull(@category_id, c.id) and
    c.event_id = isnull(@event_id, c.event_id)
  order by
    uc.category_id asc, uc.user_id asc

end
go
