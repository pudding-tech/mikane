drop function if exists edit_expense;
create or replace function edit_expense(
  ip_expense_id uuid,
  ip_name varchar(255),
  ip_description varchar(255),
  ip_amount numeric(16, 2),
  ip_category_id uuid,
  ip_payer_id uuid,
  ip_by_user_id uuid
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

  if not exists (select 1 from expense ex where ex.id = ip_expense_id) then
    raise exception 'Expense not found' using errcode = 'P0084';
  end if;

  if (ip_category_id is not null) and not exists (select 1 from category c where c.id = ip_category_id) then
    raise exception 'Category not found' using errcode = 'P0007';
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

  if (ip_category_id is not null) and not exists (
    select 1 from category c
      inner join "event" e on c.event_id = e.id
      left join user_event ue on e.id = ue.event_id and ue.user_id = ip_by_user_id
    where
      c.id = ip_category_id and
      (e.private = false or (e.private = true and ue.user_id = ip_by_user_id))
  ) then
    raise exception 'Cannot access private event' using errcode = 'P0138';
  end if;

  if (ip_payer_id is not null) and not exists (select 1 from "user" u where u.id = ip_payer_id and u.deleted = false) then
    raise exception 'User not found' using errcode = 'P0008';
  end if;

  if exists (select 1 from "event" e inner join category c on c.event_id = e.id inner join expense ex on ex.category_id = c.id where ex.id = ip_expense_id and e.status != 1) then
    raise exception 'Only active events can be edited' using errcode = 'P0118';
  end if;

  if (ip_payer_id is not null) and not exists (select ue.user_id from user_event ue inner join category c on ue.event_id = c.event_id where c.id = coalesce(ip_category_id, c.id) and ue.user_id = ip_payer_id) then
    raise exception 'User cannot pay for expense as user is not in event' using errcode = 'P0062';
  end if;

  update
    expense e
  set
    name = coalesce(ip_name, e.name),
    description = nullif(trim(coalesce(ip_description, e.description)), ''),
    amount = coalesce(ip_amount, e.amount),
    category_id = coalesce(ip_category_id, e.category_id),
    payer_id = coalesce(ip_payer_id, e.payer_id)
  where
    e.id = ip_expense_id;
  
  return query
  select * from get_expenses(null, null, ip_expense_id, ip_by_user_id);

end;
$$
language plpgsql;
