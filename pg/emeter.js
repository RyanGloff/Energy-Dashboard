const { grabClient } = require('./pgUtils.js');
const { getDeviceIdForAlias } = require('./devices.js');

async function getEmeterDataForDeviceByAlias(alias, start, end) {
    const deviceId = await getDeviceIdForAlias(alias);
    if (deviceId === null) return null;

    if (start) start = start.toISOString();
    if (end) end = end.toISOString();
    if (!end) end = (new Date()).toISOString();
    const query = `SELECT * FROM public.emeter_data WHERE device_id = ${deviceId} AND timestamp > '${start}' AND timestamp < '${end}' ORDER BY timestamp ASC;`;
    const queryResult = await (await grabClient()).query(query);
    return queryResult.rows;
}

async function getEmeterDataForDeviceByAliasAtFrequency(alias, start, end, frequency) {
    const deviceId = await getDeviceIdForAlias(alias);
    if (deviceId === null) return null;

    if (start) start = start.toISOString();
    if (end) end = end.toISOString();
    if (!end) end = (new Date()).toISOString();
    const query = `SELECT MAX(power_mw) AS power_mw, MAX(voltage_mv) AS voltage_mv, MAX(current_ma) AS current_ma, MAX(total_wh) AS total_wh, MAX(timestamp) AS timestamp FROM public.emeter_data WHERE device_id='${deviceId}' AND timestamp > '${start}' AND timestamp < '${end}' GROUP BY (ROUND(EXTRACT(EPOCH FROM timestamp) / ${frequency})) ORDER BY timestamp ASC;`;
    const queryResults = await (await grabClient()).query(query);
    return queryResults.rows;
}

async function postEmeterData(data) {
    let deviceId = await getDeviceIdForAlias(data.alias);
    await (await grabClient()).query(`INSERT INTO public.emeter_data(timestamp, "device_id", current_ma, voltage_mv, power_mw, total_wh) VALUES ('${data.timestamp.toISOString()}', '${deviceId}', ${data.currentMA}, ${data.voltageMV}, ${data.powerMW}, ${data.totalWH});`);
}

async function purgeOldEmeterData(numDays) {
    await (await grabClient()).query(`DELETE FROM public.emeter_data WHERE timestamp < (NOW() - INTERVAL '${numDays} DAYS');`);
    return (await (await grabClient()).query(`SELECT COUNT(id) FROM public.emeter_data;`)).rows[0].count;
}

module.exports = {
    getEmeterDataForDeviceByAlias,
    getEmeterDataForDeviceByAliasAtFrequency,
    postEmeterData,
    purgeOldEmeterData
};
