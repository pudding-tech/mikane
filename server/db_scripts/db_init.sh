# Wait to be sure that SQL Server came up
sleep 30s

# Create the DB and run the setup script to create tables in the DB
echo "Creating database and running db_schema script"
/opt/mssql-tools/bin/sqlcmd -S "${DB_SERVER}" -U "sa" -P "${DB_PASSWORD}" -d "master" -Q 'CREATE DATABASE mikane'
/opt/mssql-tools/bin/sqlcmd -S "${DB_SERVER}" -U "sa" -P "${DB_PASSWORD}" -d "mikane" -i "db_scripts/schema/db_schema.sql"

# Run all scripts within the db_scripts folder
echo "Running all procedure scripts"
for script_file in db_scripts/*.sql; do
  echo "Running script: $script_file"
  /opt/mssql-tools/bin/sqlcmd -S "${DB_SERVER}" -U "sa" -P "${DB_PASSWORD}" -d "mikane" -i "$script_file"
  echo "Script execution completed"
done
