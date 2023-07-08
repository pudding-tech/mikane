# Run Microsoft SQl Server and initialization script (at the same time)
chmod -R +x ./bash_scripts
/bash_scripts/db_init.sh & /opt/mssql/bin/sqlservr
