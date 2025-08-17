drop function if exists log_server_to_db;
create or replace function log_server_to_db(
  ip_timestamp timestamp,
  ip_level varchar(50),
  ip_message text
)
returns void as
$$
begin

  insert into log_server("timestamp", "level", "message")
    values (ip_timestamp, ip_level, ip_message);

end;
$$
language plpgsql;
