const { grabClient } = require('./pgUtils.js');

const deviceIdCache = {};

function log(str) {
    console.log(`[pg/devices] ${str}`);
}

async function deleteDeviceById(id) {
    await (await grabClient()).query(`DELETE FROM public.devices WHERE id = ${id};`);
}

async function getDeviceByAlias(alias) {
    const deviceResult = await (await grabClient()).query(`SELECT * FROM public.devices WHERE alias = '${alias}';`);
    if (deviceResult.rows.length === 0) return null;
    return deviceResult.rows[0];
}

async function getDeviceIdForAlias(alias, createIfNotFound=true) {
    let deviceId;
    if (deviceIdCache.hasOwnProperty(alias)) {
        deviceId = deviceIdCache[alias];
    } else {
        // Ensure device is found in devices. Grab id for insert
        const deviceResult = await (await grabClient()).query(`SELECT id FROM public.devices WHERE alias = '${alias}';`);
        if (deviceResult.rows.length === 0) {
            if (createIfNotFound) {
                deviceId = (await (await grabClient()).query(`INSERT INTO public.devices(alias) VALUES ('${alias}') RETURNING id;`)).rows[0].id;
                log(`Device created for ${alias}. New id: ${deviceId}`);
            } else {
                return null;
            }
        } else {
            deviceId = deviceResult.rows[0].id;
            log(`Device id found. Id: ${deviceId}`);
        }
        deviceIdCache[alias] = deviceId;
    }
    return deviceId;
}

async function getDeviceById(id) {
    const deviceResult = await (await grabClient()).query(`SELECT * FROM public.devices WHERE id = ${id};`);
    if (deviceResult.rows.length === 0) return null;
    return deviceResult.rows[0];
}

async function getDevices() {
    return (await (await grabClient()).query(`SELECT * FROM public.devices;`)).rows;
}

async function patchDevice(id, patch) {
    let query = `UPDATE public.devices SET "alias"='${patch.alias}' WHERE id = ${id} RETURNING *;`;
    const updateRes = await (await grabClient()).query(query);
    if (updateRes.rows.length === 0) return null;
    return updateRes.rows[0];
}

module.exports = {
    deleteDeviceById,
    getDeviceByAlias,
    getDeviceIdForAlias,
    getDeviceById,
    getDevices,
    patchDevice
};