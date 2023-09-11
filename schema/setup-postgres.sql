CREATE DATABASE "energy-dashboard";

CREATE USER IF  "energy-dashboard-app-user" WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE "energy-dashboard" to "energy-dashboard-app-user";

\echo 'Example login permissions in pg_hba.conf:'
\echo 'local energy-dashboard energy-dashboard-app-user md5'
