drop function if exists log_client_to_db;
create or replace function log_client_to_db(
  ip_timestamp timestamp,
  ip_level varchar(50),
  ip_message text,
  ip_user_id uuid,
  ip_session_id varchar(255),
  ip_ip varchar(255)
)
returns void as
$$
begin

  insert into log_client("timestamp", "level", "message", "user_id", "session_id", "ip")
    values (ip_timestamp, ip_level, ip_message, ip_user_id, ip_session_id, ip_ip);

end;
$$
language plpgsql;
