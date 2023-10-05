drop function if exists new_expense;
create or replace function new_expense(
  ip_name varchar(255),
  ip_description varchar(255),
  ip_amount numeric(16, 2),
  ip_category_id uuid,
  ip_payer_id uuid
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
  payer_deleted boolean
) as
$$
declare
  tmp_expense_id uuid;
begin

  if not exists (select 1 from category c where c.id = ip_category_id) then
    raise exception 'Category not found' using errcode = 'P0007';
  end if;

  if not exists (select 1 from "user" u where u.id = ip_payer_id and u.deleted = false) then
    raise exception 'User not found' using errcode = 'P0008';
  end if;

  if exists (select 1 from "event" e inner join category c on c.event_id = e.id where c.id = ip_category_id and e.status != 1) then
    raise exception 'Only active events can be edited' using errcode = 'P0118';
  end if;

  if not exists (select ue.user_id from user_event ue inner join category c on ue.event_id = c.event_id where c.id = ip_category_id and ue.user_id = ip_payer_id) then
    raise exception 'User cannot pay for expense as user is not in event' using errcode = 'P0062';
  end if;

  insert into expense("name", "description", amount, category_id, payer_id, created)
    values (ip_name, nullif(trim(ip_description), ''), ip_amount, ip_category_id, ip_payer_id, CURRENT_TIMESTAMP)
    returning expense.id into tmp_expense_id;

  return query
  select * from get_expenses(null, null, tmp_expense_id);

end;
$$
language plpgsql;
