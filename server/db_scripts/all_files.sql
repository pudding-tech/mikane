create database puddingdebt
go
use puddingdebt
go

create table [user] (
  id int identity(1,1) primary key,
  [name] nvarchar(255) not null,
  email nvarchar(255) not null,
  [password] nvarchar(255) not null,
  created datetime not null
)
go

create table [event] (
  id int identity(1,1) primary key,
  [name] nvarchar(255) not null unique,
  created datetime not null,
  [guid] uniqueidentifier not null default newid()
)
go

create table user_event (
  user_id int foreign key references [user](id) on delete cascade,
  event_id int foreign key references [event](id) on delete cascade,
  [admin] bit not null,
  joined_date datetime not null,
  primary key (user_id, event_id)
)
go

create table category (
  id int identity(1,1) primary key,
  [name] nvarchar(255) not null,
  weighted bit,
  event_id int foreign key references [event](id) on delete cascade
)
go

create table expense (
  id int identity(1,1) primary key,
  [name] nvarchar(255) not null,
  [description] nvarchar(255) not null,
  amount numeric(16, 2) not null,
  category_id int foreign key references category(id) on delete cascade,
  payer_id int foreign key references [user](id) on delete cascade,
  date_added datetime not null
)
go

create table category_user (
  category_id int foreign key references category(id) on delete cascade,
  user_id int foreign key references [user](id) on delete cascade,
  [weight] numeric(14),
  primary key (category_id, user_id)
)
go

if object_id ('add_user_to_category') is not null
  drop procedure add_user_to_category
go
create procedure add_user_to_category
  @category_id int,
  @user_id int,
  @weight numeric(14)
as
begin

  declare @weighted bit
  declare @event_id int

  select @weighted = weighted from category where id = @category_id

  if (@weighted = 1 and @weight is null)
    begin;
      throw 51000, 'Weight required when adding user to weighted category', 1
    end
  else if (@weighted = 1)
    begin
      insert into category_user (category_id, user_id, [weight]) values (@category_id, @user_id, @weight)
    end
  else
    begin
      insert into category_user (category_id, user_id) values (@category_id, @user_id)
    end

  select top 1
    @event_id = e.id
  from [event] e
    inner join category c on c.event_id = e.id
  where c.id = @category_id

  exec get_categories @event_id, @category_id

end
go
if object_id ('add_user_to_event') is not null
  drop procedure add_user_to_event
go
create procedure add_user_to_event
  @user_id int,
  @event_id int,
  @admin bit
as
begin

  insert into user_event (user_id, event_id, [admin], joined_date) values (@user_id, @event_id, @admin, GETDATE())

  exec get_events @event_id

end
go
if object_id ('delete_category') is not null
  drop procedure delete_category
go
create procedure delete_category
  @category_id int
as
begin

  delete from category where id = @category_id

end
go
if object_id ('delete_event') is not null
  drop procedure delete_event
go
create procedure delete_event
  @event_id int
as
begin

  delete from [event] where id = @event_id

end
go
if object_id ('delete_expense') is not null
  drop procedure delete_expense
go
create procedure delete_expense
  @expense_id int
as
begin

  delete from expense where id = @expense_id

end
go
if object_id ('delete_user') is not null
  drop procedure delete_user
go
create procedure delete_user
  @user_id int
as
begin

  delete from [user] where id = @user_id

end
go
if object_id ('edit_category_weighted_status') is not null
  drop procedure edit_category_weighted_status
go
create procedure edit_category_weighted_status
  @category_id int,
  @weighted bit
as
begin

  declare @event_id int
  declare @currently_weighted bit

  select @currently_weighted = weighted from category where id = @category_id

  update category set weighted = @weighted where id = @category_id
  update category_user set [weight] = 1 where category_id = @category_id

  select top 1
    @event_id = e.id
  from [event] e
    inner join category c on c.event_id = e.id
  where c.id = @category_id

  exec get_categories @event_id, @category_id

end
go
if object_id ('edit_user') is not null
  drop procedure edit_user
go
create procedure edit_user
  @user_id int,
  @name nvarchar(255)
as
begin

  update [user] set [name] = @name where id = @user_id
  
  select * from [user] where id = @user_id

end
go
if object_id ('edit_user_weight') is not null
  drop procedure edit_user_weight
go
create procedure edit_user_weight
  @category_id int,
  @user_id int,
  @weight numeric(14)
as
begin

  update category_user
  set [weight] = @weight
  where category_id = @category_id
    and user_id = @user_id

  declare @event_id int
  select @event_id = event_id from category where id = @category_id

  exec get_categories @event_id, @category_id

end
go
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
    string_agg(concat(cu.user_id, ',', u.name, ',', uw.weight), ';') as 'user_weight'
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
go
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
        id, [name], created, [guid]
      from
        [event]
      order by id desc
    end
  
  else
    begin
      select
        id, [name], created, [guid]
      from
        [event]
      where
        id = @event_id
      order by id desc
    end

end
go
if object_id ('get_event_payment_data') is not null
  drop procedure get_event_payment_data
go
create procedure get_event_payment_data
  @event_id int
as
begin

  execute get_users @event_id
  execute get_categories @event_id, null
  execute get_expenses @event_id, null

end
go
if object_id ('get_expenses') is not null
  drop procedure get_expenses
go
create procedure get_expenses
  @event_id int,
  @user_id int
as
begin

  if (@user_id is null)
  begin
    select ex.*, c.name as category_name, u.name as payer
    from
      expense ex
      inner join category c on c.id = ex.category_id
      inner join [event] ev on ev.id = c.event_id
      inner join [user] u on u.id = ex.payer_id
    where
      ev.id = @event_id
    order by
      ex.date_added desc
  end

  else
  begin
    select ex.*, c.name as category_name, u.name as payer
    from
      expense ex
      inner join category c on c.id = ex.category_id
      inner join [event] ev on ev.id = c.event_id
      inner join [user] u on u.id = ex.payer_id
    where
      ev.id = @event_id and
      u.id = @user_id
    order by
      ex.date_added desc
  end

end
go
if object_id ('get_users') is not null
  drop procedure get_users
go
create procedure get_users
  @event_id int
as
begin

  if (@event_id is null)
    begin
        
      select id, [name], email, created from
        [user]
      order by
        id
      
    end
  else
    begin
        
      select u.id, u.[name], u.email, u.created, ue.admin, ue.joined_date from
        [user] u
        inner join user_event ue on ue.user_id = u.id
      where
        ue.event_id = @event_id
      order by
        u.id

    end

end
go
if object_id ('new_category') is not null
  drop procedure new_category
go
create procedure new_category
  @event_id int,
  @name nvarchar(255),
  @weighted bit
as
begin

  insert into category(event_id, [name], weighted) values (@event_id, @name, @weighted)

  select * from category where id = @@IDENTITY

end
go
if object_id ('new_event') is not null
  drop procedure new_event
go
create procedure new_event
  @name nvarchar(255)
as
begin

  insert into [event]([name], created) values (@name, GETDATE())

  select * from [event] where id = @@IDENTITY

end
go
if object_id ('new_expense') is not null
  drop procedure new_expense
go
create procedure new_expense
  @name nvarchar(255),
  @description nvarchar(255),
  @amount numeric(16, 2),
  @category_id int,
  @payer_id int
as
begin
  
  set @description = isnull(@description, '')

  insert into expense([name], [description], amount, category_id, payer_id, date_added)
    values (@name, @description, @amount, @category_id, @payer_id, GETDATE())

  select ex.*, c.name as category_name, u.name as payer from expense ex
    inner join category c on c.id = ex.category_id
    inner join [user] u on u.id = ex.payer_id
  where ex.id = @@IDENTITY

end
go
if object_id ('new_user') is not null
  drop procedure new_user
go
create procedure new_user
  @name nvarchar(255),
  @email nvarchar(255),
  @password nvarchar(255)
as
begin

  insert into [user]([name], email, [password], created) values (@name, @email, @password, GETDATE())

  select id, [name], email, created from [user] where id = @@IDENTITY

end
go
if object_id ('remove_user_from_category') is not null
  drop procedure remove_user_from_category
go
create procedure remove_user_from_category
  @category_id int,
  @user_id int
as
begin

  delete from category_user where category_id = @category_id and user_id = @user_id

  declare @event_id int

  select top 1
    @event_id = e.id
  from [event] e
    inner join category c on c.event_id = e.id
  where c.id = @category_id

  exec get_categories @event_id, @category_id

end
go
if object_id ('rename_category') is not null
  drop procedure rename_category
go
create procedure rename_category
  @category_id int,
  @name nvarchar(255)
as
begin

  update category set [name] = @name where id = @category_id
  
  select * from category where event_id = (
    select event_id from category where id = @category_id
  )

end
go
