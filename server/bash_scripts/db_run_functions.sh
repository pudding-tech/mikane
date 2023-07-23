USER=${DB_USER:-postgres}

# Wait to be sure that PostgreSQL database is ready
echo "Waiting for PostgreSQL server to be ready before running functions"
bash ./bash_scripts/wait-until.sh "psql -U '${USER}' -d mikane -c 'SELECT '\''database mikane is running'\'';'" 60
exit_status1=$?
if [ "${exit_status1}" -gt 0 ]; then
  echo "Could not connect to mikane, aborting running function scripts"
  exit 1
fi
echo "PostgreSQL server is ready to run functions"

# Run all scripts within the db_scripts folder
echo "Container startup: Running all function scripts"
for script_file in db_scripts/*.sql; do
  echo "Running script: $script_file"
  psql -U "$USER" -d mikane -f "$script_file"
done
echo "Scripts execution completed"
