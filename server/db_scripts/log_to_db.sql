drop function if exists log_to_db;
create or replace function log_to_db(
  ip_timestamp timestamp,
  ip_level varchar(50),
  ip_origin varchar(20),
  ip_message text
)
returns void as
$$
begin

  insert into log("timestamp", "level", "origin", "message")
    values (ip_timestamp, ip_level, coalesce(ip_origin, 'server'), ip_message);

end;
$$
language plpgsql;
