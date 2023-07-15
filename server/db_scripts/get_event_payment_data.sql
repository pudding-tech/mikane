drop function if exists get_event_payment_data;
create or replace function get_event_payment_data(
  ip_event_id uuid
)
returns table(
  id uuid,
  name varchar(255),
  icon varchar(255),
  weighted boolean,
  event_id uuid,
  created timestamp,
  user_weights jsonb
)
or table(
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

  -- if (ip_event_id is null) then
  --   return;
  -- end if;

  -- return query
  -- select * from get_users(ip_event_id, null);

  return query
  select * from get_categories(ip_event_id, null);

  return query
  select * from get_expenses(ip_event_id, null, null);

end;
$$
language plpgsql;
