-- Example usage
-- sudo -u postgres psql < schema/setup-postgres.sql

CREATE DATABASE "energy-dashboard";
\c energy-dashboard

CREATE USER "energy-dashboard-app-user" WITH PASSWORD 'password';
GRANT ALL ON DATABASE "energy-dashboard" to "energy-dashboard-app-user";
GRANT ALL ON SCHEMA public to "energy-dashboard-app-user";

-- Example login permissions in pg_hba.conf
-- local all energy-dashboard-app-user md5


-- To undo above changes
-- DROP DATABASE "energy-dashboard";
-- REASSIGN OWNED BY "energy-dashboard-app-user" TO postgres;
-- DROP OWNED BY "energy-dashboard-app-user";
-- DROP USER "energy-dashboard-app-user";