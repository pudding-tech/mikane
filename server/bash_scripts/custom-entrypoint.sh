#!/bin/bash

# Check if the data directory exists and contains the PG_VERSION file
if [ -f /var/lib/postgresql/data/PG_VERSION ]; then

  echo "Database already exists - will run db_run_functions.sh"
  ./bash_scripts/db_run_functions.sh & exec usr/local/bin/docker-entrypoint.sh postgres

else

  echo "Database does not already exist - will start postgres as normal"
  exec usr/local/bin/docker-entrypoint.sh postgres

fi
