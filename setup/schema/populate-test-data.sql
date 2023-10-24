INSERT INTO public.devices(alias) VALUES ('WB Heater');

INSERT INTO public.alarms(device_id, low_value, fault_duration, "name", metric) VALUES (1, 175000, 4300000, 'WB Heater - Abnormally low value', 'power_mw');
INSERT INTO public.alarms(device_id, high_value, fault_duration, "name", metric) VALUES (1, 210000, 30000, 'WB Heater - Abnormally high value', 'power_mw');
