if object_id ('get_categories') is not null
  drop procedure get_categories
go
create procedure get_categories
  @event_id int,
  @category_id int
as
begin

  select 
    cu.user_id,
    c.id as 'category_id',
    c.weighted,
    'weight' = case
      when c.weighted = 1 then cu.weight
      when c.weighted = 0 then 1 end
  into
    #weights_temp
  from category_user cu
    inner join category c on c.id = cu.category_id

  select
    cu.category_id,
    string_agg(concat(
                cu.user_id, ',',
                u.name, ',', 
                uw.weight), ';') as 'user_weight'
  into
    #temp
  from
    category_user cu
    inner join [user] u on u.id = cu.user_id
    inner join category c on c.id = cu.category_id
    inner join #weights_temp uw
      on uw.user_id = cu.user_id and
          uw.category_id = c.id
  group by
    cu.category_id

  if (@category_id is null)
  begin

    select
      c.*,
      #temp.user_weight
    from category c
      left join #temp on c.id = #temp.category_id
    where c.event_id = @event_id

  end
  else
  begin

    select
      c.*,
      #temp.user_weight
    from category c
      left join #temp on c.id = #temp.category_id
    where c.event_id = @event_id
      and c.id = @category_id

  end

end