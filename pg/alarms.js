const { grabClient } = require('./pgUtils.js');

function log(str) {
    console.log(`[pg/alarms] ${str}`);
}

async function createAlarm(alarm) {
    const query = `INSERT INTO public.alarms(device_id ${alarm.lowValue ? `, ${alarm.lowValue}` : ''} ${alarm.highValue ? `, ${alarm.highValue}` : ''}, fault_duration, "name") VALUES (${alarm.deviceId}, ${alarm.lowValue ? `, ${alarm.lowValue}` : ''}, ${alarm.highValue ? `, ${alarm.highValue}` : ''}, ${alarm.faultDuration}, '${alarm.name}') RETURNING *;`
    log(query);
    return (await (await grabClient()).query(query)).rows[0];
}

async function getAlarmById(id) {
    const result = (await (await grabClient()).query(`SELECT * FROM public.alarms WHERE id = ${id};`));
    if (result.rows.length === 0) return null;
    return result.rows[0];
}

async function getAlarms() {
    return (await (await grabClient()).query(`SELECT * FROM public.alarms;`)).rows;
}

async function getAlarmsForDevice(deviceId) {
    return (await (await grabClient()).query(`SELECT * FROM public.alarms WHERE device_id = ${deviceId};`)).rows;
}

async function deleteAlarm(id) {
    await (await grabClient()).query(`DELETE FROM public.alarms WHERE id = ${id};`);
}

module.exports = {
    createAlarm,
    getAlarmById,
    getAlarms,
    getAlarmsForDevice,
    deleteAlarm
};