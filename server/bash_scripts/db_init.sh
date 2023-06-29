HOST=${DB_HOST:-localhost}
PORT=${DB_PORT:-1433}
USER=${DB_USER:-sa}

# Wait to be sure that SQL Server is running
echo "Waiting for SQL Server to start"
chmod +x ./bash_scripts/wait-until.sh
./bash_scripts/wait-until.sh "/opt/mssql-tools/bin/sqlcmd -S '${HOST},${PORT}' -U '${USER}' -P "${DB_PASSWORD}" -d 'master' -Q 'select '\''database master is running'\'''" 60 2> /dev/null
exit_status=$?
if [ "${exit_status}" -eq 1 ]; then
  echo "Could not connect to ${HOST}:${PORT}, aborting script"
  exit 1
fi
echo "SQL Server is ready"

# Function to check if a database exists (checks for 5 seconds in case database is still setting up)
database_exists() {
  local database_name="$1"
  bash_scripts/wait-until.sh "/opt/mssql-tools/bin/sqlcmd -S '${HOST},${PORT}' -U '${USER}' -P "${DB_PASSWORD}" -d '$database_name' -Q 'select '\''database $database_name is running'\'''" 5 2> /dev/null
  exit_status=$?
  if [ "${exit_status}" -eq 1 ]; then
    return 1
  fi
  return 0
}

if database_exists "mikane"; then
  echo "Database mikane already exists"
else
  # Create the DB and run the setup script to create tables in the DB
  echo "Database mikane does not exist - creating database and running db_schema script"
  /opt/mssql-tools/bin/sqlcmd -S "${HOST},${PORT}" -U "${USER}" -P "${DB_PASSWORD}" -d "master" -Q 'CREATE DATABASE mikane'
  /opt/mssql-tools/bin/sqlcmd -S "${HOST},${PORT}" -U "${USER}" -P "${DB_PASSWORD}" -d "mikane" -i "db_scripts/schema/db_schema.sql"
  echo "Successfully created database mikane and inserted tables"
fi

# Run all scripts within the db_scripts folder
echo "Running all procedure scripts"
for script_file in db_scripts/*.sql; do
  echo "Running script: $script_file"
  /opt/mssql-tools/bin/sqlcmd -S "${HOST},${PORT}" -U "${USER}" -P "${DB_PASSWORD}" -d "mikane" -i "$script_file"
done
echo "Scripts execution completed"
