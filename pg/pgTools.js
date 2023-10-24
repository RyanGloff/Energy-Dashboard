const { grabClient } = require('./pgUtils.js');
const { getDeviceIdForAlias } = require('./devices.js');

async function postError(type, err, deviceAlias) {
    const deviceId = await getDeviceIdForAlias(deviceAlias);
    const query = `INSERT INTO public.errors(device_id, timestamp, type, message) VALUES (${deviceId}, '${(new Date()).toISOString()}', '${type}', '${err}');`;
    console.log(query);
    await (await grabClient()).query(query);
}

async function getSpaceUsed() {
    return (await (await grabClient()).query(`SELECT pg_size_pretty(pg_database_size('energy-dashboard'));`)).rows[0].pg_size_pretty;
}

async function postLog(message, location) {
    const query = `INSERT INTO public.logs(message, timestamp${location ? ', location' : ''}) VALUES ('${message}', '${(new Date()).toISOString()}'${location ? `, '${location}'` : ''})`;
    console.log(query);
    (await grabClient()).query(query);
}

module.exports = {
    getSpaceUsed,
    postError,
    postLog
};