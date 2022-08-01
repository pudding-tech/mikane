if object_id ('get_categories') is not null
  drop procedure get_categories
go
create procedure get_categories
  @event_id int,
  @category_id int
as
begin

  select
    cu.category_id,
    string_agg(concat(cu.user_id, ',', u.name, ',',  cu.weight), ';') as 'user_weight'
  into
    #temp
  from
    category_user cu
    inner join [user] u on u.id = cu.user_id
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