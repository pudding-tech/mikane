drop function if exists edit_user_preferences;
create or replace function edit_user_preferences(
  ip_user_id uuid,
  ip_public_email boolean,
  ip_public_phone boolean
)
returns table (
  id uuid,
  username varchar(255),
  first_name varchar(255),
  last_name varchar(255),
  email varchar(255),
  phone_number varchar(20),
  "password" varchar(255),
  created timestamp,
  guest boolean,
  guest_created_by uuid,
  super_admin boolean,
  public_email boolean,
  public_phone boolean
) as
$$
begin

  if not exists (select 1 from "user" u where u.id = ip_user_id and u.deleted = false) then
    raise exception 'User not found' using errcode = 'P0008';
  end if;

  if not exists (select 1 from user_preferences up where up.user_id = ip_user_id) then
    raise exception 'Something went wrong - user does not have a preferences entry in the database' using errcode = 'P0134';
  end if;

  update
    user_preferences up
  set
    public_email = coalesce(ip_public_email, up.public_email),
    public_phone = coalesce(ip_public_phone, up.public_phone)
  where
    up.user_id = ip_user_id;
  
  return query
  select * from get_user(ip_user_id, null, false);

end;
$$
language plpgsql;
