const { Router } = require('express');
const { createAlarm, getAlarmById, getAlarms, getAlarmsForDevice, deleteAlarm } = require('../../pg/alarms.js');
const { getDeviceIdForAlias } = require('../../pg/devices.js');

const router = Router();

router.get('/', async (req, res) => {
    let alarmsResult;
    if (req.query.deviceAlias) {
        const deviceId = await getDeviceIdForAlias(req.query.deviceAlias);
        if (deviceId === null) {
            res.sendStatus(404);
            return;
        }
        alarmsResult = await getAlarmsForDevice(deviceId);
    } else {
        alarmsResult = await getAlarms();
    }
    res.json(alarmsResult);
});

router.get('/:id', async (req, res) => {
    const alarmsResult = await getAlarmById(req.params.id);
    if (alarmsResult === null) {
        res.sendStatus(404);
        return;
    }
    res.json(alarmsResult);
});

router.post('/', async (req, res) => {
    if (!req.body.hasOwnProperty('deviceAlias')) {
        res.status(400).send('deviceAlias must be defined in request body');
        return;
    }
    if (!req.body.hasOwnProperty('faultDuration')) {
        res.status(400).send('faultDuration must be defined in request body');
        return;
    }
    if (!req.body.hasOwnProperty('name')) {
        res.status(400).send('name must be defined in request body');
        return;
    }
    if ((!req.body.lowValue) && (!req.body.highValue)) {
        res.status(400).send('Either lowValue or highValue must be defined in body');
        return;
    }

    const deviceId = await getDeviceIdForAlias(req.body.deviceAlias);
    if (deviceId === null) {
        res.sendStatus(404);
        return;
    }
    const alarmData = {
        deviceId,
        faultDuration: req.body.faultDuration,
        name: req.body.name
    };
    if (req.body.lowValue) alarmData.lowValue = req.body.lowValue;
    if (req.body.highValue) alarmData.highValue = req.body.highValue;
    const newAlarm = await createAlarm(alarmData);
    res.json(newAlarm);
});

module.exports = router;