-- Example usage:
-- psql -U energy-dashboard-app-user -d energy-dashboard -W -f setup/schema/create-schema.sql

-- Create sequences
CREATE SEQUENCE IF NOT EXISTS public.alarms_id_seq;
ALTER SEQUENCE public.alarms_id_seq RESTART WITH 1;
CREATE SEQUENCE IF NOT EXISTS public.devices_id_seq;
ALTER SEQUENCE public.devices_id_seq RESTART WITH 1;
CREATE SEQUENCE IF NOT EXISTS public.emeter_data_id_seq;
ALTER SEQUENCE public.emeter_data_id_seq RESTART WITH 1;
CREATE SEQUENCE IF NOT EXISTS public.errors_id_seq;
ALTER SEQUENCE public.errors_id_seq RESTART WITH 1;
CREATE SEQUENCE IF NOT EXISTS public.faults_id_seq;
ALTER SEQUENCE public.faults_id_seq RESTART WITH 1;
CREATE SEQUENCE IF NOT EXISTS public.logs_id_seq;
ALTER SEQUENCE public.logs_id_seq RESTART WITH 1;

-- Drop Foreign Keys if exists to allow for dropping tables
ALTER TABLE IF EXISTS public.alarms DROP CONSTRAINT IF EXISTS alarms_device_id_fkey;
ALTER TABLE IF EXISTS public.emeter_data DROP CONSTRAINT IF EXISTS emeter_data_device_id_fkey;
ALTER TABLE IF EXISTS public.errors DROP CONSTRAINT IF EXISTS error_device_id_fkey;
ALTER TABLE IF EXISTS public.faults DROP CONSTRAINT IF EXISTS faults_alarm_id_fkey;

-- Create tables
DROP TABLE IF EXISTS public.alarms;
CREATE TABLE public.alarms(
    id bigint NOT NULL DEFAULT nextval('alarms_id_seq'::regclass),
    device_id bigint NOT NULL,
    low_value bigint,
    high_value bigint,
    fault_duration bigint NOT NULL,
    "name" character varying,
    in_alarm boolean NOT NULL DEFAULT false,
    metric character varying NOT NULL DEFAULT 'power_mw',
    CONSTRAINT alarms_pkey PRIMARY KEY (id)
);

DROP TABLE IF EXISTS public.devices;
CREATE TABLE public.devices(
    id bigint NOT NULL DEFAULT nextval('devices_id_seq'::regclass),
    alias character varying NOT NULL,
    CONSTRAINT devices_pkey PRIMARY KEY (id, alias),
    UNIQUE (id)
);

DROP TABLE IF EXISTS public.emeter_data;
CREATE TABLE public.emeter_data(
    id bigint NOT NULL DEFAULT nextval('emeter_data_id_seq'::regclass),
    current_ma integer,
    voltage_mv integer,
    power_mw integer,
    total_wh integer,
    "timestamp" timestamp with time zone NOT NULL,
    device_id bigint NOT NULL,
    CONSTRAINT emeter_data_pkey PRIMARY KEY (id)
);

DROP TABLE IF EXISTS public.errors;
CREATE TABLE public.errors(
    id bigint NOT NULL DEFAULT nextval('errors_id_seq'::regclass),
    device_id bigint,
    "timestamp" timestamp with time zone NOT NULL,
    "type" character varying NOT NULL,
    "message" text,
    CONSTRAINT errors_pkey PRIMARY KEY (id)
);

DROP TABLE IF EXISTS public.faults;
CREATE TABLE public.faults(
    id bigint NOT NULL DEFAULT nextval('faults_id_seq'::regclass),
    alarm_id bigint NOT NULL,
    "timestamp" timestamp with time zone NOT NULL,
    CONSTRAINT faults_pkey PRIMARY KEY (id)
);

DROP TABLE IF EXISTS public.logs;
CREATE TABLE public.logs(
    id bigint NOT NULL DEFAULT nextval('logs_id_seq'::regclass),
    "location" character varying,
    "message" text NOT NULL,
    "timestamp" timestamp with time zone NOT NULL,
    CONSTRAINT logs_pkey PRIMARY KEY (id)
);

-- Foreign Keys
ALTER TABLE IF EXISTS public.alarms
    ADD CONSTRAINT alarms_device_id_fkey FOREIGN KEY (device_id)
    REFERENCES public.devices (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public.emeter_data
    ADD CONSTRAINT emeter_data_device_id_fkey FOREIGN KEY (device_id)
    REFERENCES public.devices (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public.errors
    ADD CONSTRAINT error_device_id_fkey FOREIGN KEY (device_id)
    REFERENCES public.devices (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public.faults
    ADD CONSTRAINT faults_alarm_id_fkey FOREIGN KEY (alarm_id)
    REFERENCES public.alarms (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION;



