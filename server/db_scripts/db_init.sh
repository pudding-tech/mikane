# Wait to be sure that SQL Server came up
sleep 30s

echo "Running db_init script"
echo ${DB_SERVER}
echo ${DB_DATABASE}

# Run the setup script to create the DB and the schema in the DB
# Note: make sure that your password matches what is in the Dockerfile
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d master -i db_scripts/db_init.sql

/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d master -i db_scripts/db_test_data.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d master -i db_scripts/add_user_to_category.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d master -i db_scripts/delete_category.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d master -i db_scripts/delete_event.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d master -i db_scripts/delete_expense.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d master -i db_scripts/delete_user.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d master -i db_scripts/edit_category_weighted_status.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d master -i db_scripts/edit_user_weight.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d master -i db_scripts/get_categories.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d master -i db_scripts/get_events.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d master -i db_scripts/get_expenses.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d master -i db_scripts/get_user_expenses.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d master -i db_scripts/get_users.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d master -i db_scripts/new_category.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d master -i db_scripts/new_event.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d master -i db_scripts/new_expense.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d master -i db_scripts/new_user.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d master -i db_scripts/remove_user_from_category.sql