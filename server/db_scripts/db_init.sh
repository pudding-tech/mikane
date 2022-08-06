# Wait to be sure that SQL Server came up
sleep 30s

echo "Running db_init script"
echo ${DB_SERVER}
echo ${DB_DATABASE}

# Run the setup script to create the DB and the schema in the DB
# Note: make sure that your password matches what is in the Dockerfile
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d master -i db_scripts/db_init.sql