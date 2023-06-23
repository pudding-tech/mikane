# Wait to be sure that SQL Server came up
sleep 30s

echo "Running db_schema script"

# Create the DB and run the setup script to create tables in the DB
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d master -Q 'CREATE DATABASE puddingdebt'
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/schema/db_schema.sql

echo "Running procedures scripts"
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/add_user_as_event_admin.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/add_user_to_category.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/add_user_to_event.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/change_password.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/delete_category.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/delete_event.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/delete_expense.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/delete_user.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/edit_category_weighted_status.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/edit_event.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/edit_user_weight.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/edit_user.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/get_api_keys.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/get_categories.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/get_event_by_name.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/get_event_payment_data.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/get_events.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/get_expenses.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/get_user_hash.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/get_user_id.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/get_user.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/get_users.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/new_api_key.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/new_category.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/new_event.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/new_expense.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/new_password_reset_key.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/new_user.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/remove_user_as_event_admin.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/remove_user_from_category.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/remove_user_from_event.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/rename_category.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/reset_password.sql
/opt/mssql-tools/bin/sqlcmd -S ${DB_SERVER} -U sa -P ${DB_PASSWORD} -d puddingdebt -i db_scripts/verify_password_reset_key.sql
