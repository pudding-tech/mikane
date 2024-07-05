drop function if exists get_expenses;
create or replace function get_expenses(
  ip_event_id uuid,
  ip_user_id uuid,
  ip_expense_id uuid,
  ip_by_user_id uuid
)
returns table (
  id uuid,
  name varchar(255),
  description varchar(255),
  amount numeric(16, 2),
  expense_date date,
  created timestamp,
  category_id uuid,
  category_name varchar(255),
  category_icon varchar(255),
  payer_id uuid,
  payer_first_name varchar(255),
  payer_last_name varchar(255),
  payer_username varchar(255),
  payer_email varchar(255),
  payer_guest boolean,
  payer_deleted boolean,
  event_id uuid,
  event_name varchar(255),
  event_private boolean
) as
$$
begin

  if (ip_expense_id is not null) then
  begin
    if not exists (select 1 from expense ex where ex.id = ip_expense_id) then
      raise exception 'Expense not found' using errcode = 'P0084';
    end if;

    if not exists (
      select 1 from expense ex
        inner join category c on ex.category_id = c.id
        inner join "event" e on c.event_id = e.id
        left join user_event ue on e.id = ue.event_id and ue.user_id = ip_by_user_id
      where
        ex.id = ip_expense_id and
        (e.private = false or (e.private = true and ue.user_id = ip_by_user_id))
    ) then
      raise exception 'Cannot access private event' using errcode = 'P0138';
    end if;

    return query
    select
      ex.id, ex.name, ex.description, ex.amount, ex.expense_date, ex.created,
      c.id as category_id, c.name as category_name, c.icon as category_icon,
      u.id as payer_id, u.first_name as payer_first_name, u.last_name as payer_last_name, u.username as payer_username, u.email as payer_email, u.guest as payer_guest, u.deleted as payer_deleted,
      ev.id as event_id, ev.name as event_name, ev.private as event_private
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

  elsif (ip_event_id is not null and ip_user_id is null) then
  begin
    if not exists (select 1 from "event" e where e.id = ip_event_id) then
      raise exception 'Event not found' using errcode = 'P0006';
    end if;

    if not exists (
      select 1 from "event" e
        left join user_event ue on e.id = ue.event_id and ue.user_id = ip_by_user_id
      where
        e.id = ip_event_id and
        (e.private = false or (e.private = true and ue.user_id = ip_by_user_id))
    ) then
      raise exception 'Cannot access private event' using errcode = 'P0138';
    end if;

    return query
    select
      ex.id, ex.name, ex.description, ex.amount, ex.expense_date, ex.created,
      c.id as category_id, c.name as category_name, c.icon as category_icon,
      u.id as payer_id, u.first_name as payer_first_name, u.last_name as payer_last_name, u.username as payer_username, u.email as payer_email, u.guest as payer_guest, u.deleted as payer_deleted,
      ev.id as event_id, ev.name as event_name, ev.private as event_private
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

  elsif (ip_event_id is null and ip_user_id is not null) then
  begin
    if not exists (select 1 from "user" u where u.id = ip_user_id) then
      raise exception 'User not found' using errcode = 'P0008';
    end if;

    return query
    select
      ex.id, ex.name, ex.description, ex.amount, ex.expense_date, ex.created,
      c.id as category_id, c.name as category_name, c.icon as category_icon,
      u.id as payer_id, u.first_name as payer_first_name, u.last_name as payer_last_name, u.username as payer_username, u.email as payer_email, u.guest as payer_guest, u.deleted as payer_deleted,
      ev.id as event_id, ev.name as event_name, ev.private as event_private
    from
      expense ex
      inner join category c on c.id = ex.category_id
      inner join "event" ev on ev.id = c.event_id
      inner join "user" u on ex.payer_id = u.id
      left join user_event ue on ev.id = ue.event_id and ue.user_id = ip_by_user_id
    where
      u.id = ip_user_id and
      (ev.private = false or (ev.private = true and ue.user_id = ip_by_user_id))
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

    if not exists (
      select 1 from "event" e
        left join user_event ue on e.id = ue.event_id and ue.user_id = ip_by_user_id
      where
        e.id = ip_event_id and
        (e.private = false or (e.private = true and ue.user_id = ip_by_user_id))
    ) then
      raise exception 'Cannot access private event' using errcode = 'P0138';
    end if;

    return query
    select
      ex.id, ex.name, ex.description, ex.amount, ex.expense_date, ex.created,
      c.id as category_id, c.name as category_name, c.icon as category_icon,
      u.id as payer_id, u.first_name as payer_first_name, u.last_name as payer_last_name, u.username as payer_username, u.email as payer_email, u.guest as payer_guest, u.deleted as payer_deleted,
      ev.id as event_id, ev.name as event_name, ev.private as event_private
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
  end if;

end;
$$
language plpgsql;
