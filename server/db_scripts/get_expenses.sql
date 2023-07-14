drop function if exists get_expenses;
create or replace function get_expenses(
  ip_event_id uuid,
  ip_user_id uuid,
  ip_expense_id uuid
)
returns table (
  id uuid,
  name varchar(255),
  description varchar(255),
  amount numeric(16, 2),
  created timestamp,
  category_id uuid,
  category_name varchar(255),
  category_icon varchar(255),
  payer_id uuid,
  payer_first_name varchar(255),
  payer_last_name varchar(255),
  payer_username varchar(255)
) as
$$
begin
  
  if (ip_event_id is not null and ip_user_id is null) then
  begin
    if not exists (select 1 from "event" e where e.id = ip_event_id) then
      raise exception 'Event not found' using errcode = 'P0006';
    end if;

    return query
    select
      ex.id, ex.name, ex.description, ex.amount, ex.created,
      c.id as category_id, c.name as category_name, c.icon as category_icon,
      u.id as payer_id, u.first_name as payer_first_name, u.last_name as payer_last_name, u.username as payer_username
    from
      expense ex
      inner join category c on c.id = ex.category_id
      inner join "event" ev on ev.id = c.event_id
      inner join "user" u on u.id = ex.payer_id
    where
      ev.id = ip_event_id
    order by
      ex.created desc;
  end;
  
  elsif (ip_event_id is not null and ip_user_id is not null) then
  begin
    if not exists (select 1 from "event" e where e.id = ip_event_id) then
      raise exception 'Event not found' using errcode = 'P0006';
    end if;

    if not exists (select 1 from "user" u where u.id = ip_user_id) then
      raise exception 'User not found' using errcode = 'P0008';
    end if;
    
    return query
    select
      ex.id, ex.name, ex.description, ex.amount, ex.created,
      c.id as category_id, c.name as category_name, c.icon as category_icon,
      u.id as payer_id, u.first_name as payer_first_name, u.last_name as payer_last_name, u.username as payer_username
    from
      expense ex
      inner join category c on c.id = ex.category_id
      inner join "event" ev on ev.id = c.event_id
      inner join "user" u on u.id = ex.payer_id
    where
      ev.id = ip_event_id and
      u.id = ip_user_id
    order by
      ex.created desc;
  end;

  elsif (ip_expense_id is not null) then
  begin
    if not exists (select 1 from expense ex where ex.id = ip_expense_id) then
      raise exception 'Expense not found' using errcode = 'P0084';
    end if;

    return query
    select
      ex.id, ex.name, ex.description, ex.amount, ex.created,
      c.id as category_id, c.name as category_name, c.icon as category_icon,
      u.id as payer_id, u.first_name as payer_first_name, u.last_name as payer_last_name, u.username as payer_username
    from
      expense ex
      inner join category c on c.id = ex.category_id
      inner join "event" ev on ev.id = c.event_id
      inner join "user" u on u.id = ex.payer_id
    where
      ex.id = ip_expense_id
    order by
      ex.created desc;
  end;
  end if;

end;
$$
language plpgsql;
