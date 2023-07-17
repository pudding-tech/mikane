USER=${DB_USER:-postgres}
DATABASE_NAME=$([ "$ENVIRONMENT" == "test" ] && echo "mikanetest" || echo "mikane")

# Wait to be sure that PostgreSQL database is ready
echo "Waiting for PostgreSQL server to start"
bash ../bash_scripts/wait-until.sh "psql -U '${USER}' -d '$DATABASE_NAME' -c 'SELECT '\''database $DATABASE_NAME is running'\'';'" 60
exit_status1=$?
if [ "${exit_status1}" -gt 0 ]; then
  echo "Could not connect to $DATABASE_NAME, aborting database creation"
  exit 1
fi
echo "PostgreSQL server is ready"

# Run the setup script to create tables in the database
echo "Running db_schema script into database $DATABASE_NAME"
psql -U "$USER" -d "$DATABASE_NAME" -f "db_scripts/schema/db_schema.sql"
exit_status2=$?
if [ "${exit_status2}" -gt 0 ]; then
  echo "Something went wrong inserting the tables, aborting database creation"
  exit 1
fi
echo "Successfully inserted tables into $DATABASE_NAME"

# Run all scripts within the db_scripts folder
echo "Running all procedure scripts"
for script_file in db_scripts/*.sql; do
  echo "Running script: $script_file"
  psql -U "$USER" -d "$DATABASE_NAME" -f "$script_file"
done
echo "Scripts execution completed"
