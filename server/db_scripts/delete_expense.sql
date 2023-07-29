drop function if exists delete_expense;
create or replace function delete_expense(
  ip_expense_id uuid,
  ip_user_id uuid
)
returns void as
$$
begin

  if not exists (select 1 from expense ex where ex.id = ip_expense_id) then
    raise exception 'Expense not found' using errcode = 'P0084';
  end if;

  if not exists (select 1 from expense ex
                  inner join category c on c.id = ex.category_id
                  inner join user_event ue on ue.event_id = c.event_id
                where ex.id = ip_expense_id and
                      ue.user_id = ip_user_id and
                      (ex.payer_id = ip_user_id or ue."admin" = true))
  then
    raise exception 'You can only delete your own expenses (unless event admin)' using errcode = 'P0086';
  end if;

  delete from expense ex where ex.id = ip_expense_id;

end;
$$
language plpgsql;
