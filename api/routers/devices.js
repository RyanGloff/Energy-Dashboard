const express = require('express');
const router = express.Router();

const { getDeviceByAlias, getDeviceById, getDevices, patchDevice, deleteDeviceById } = require('../../pg/devices');

router.get('/', async (req, res) => {
    if (req.query.alias) {
        const device = await getDeviceByAlias(req.query.alias);
        if (device === null) {
            res.sendStatus(404);
        } else {
            res.json(device);
        }
        return;
    }
    const devices = await getDevices();
    res.json(devices);
});

router.get('/:id', async (req, res) => {
    const device = await getDeviceById(req.params.id);
    if (device === null) {
        res.sendStatus(404);
        return;
    }
    res.json(device);
});

router.patch('/:id', async (req, res) => {
    const patch = {}
    if (req.body.alias) patch.alias = req.body.alias;

    const pgResult = await patchDevice(req.params.id, patch);
    if (pgResult === null) {
        res.sendStatus(404);
        return;
    }
    return pgResult;
});

router.delete('/:id', async (req, res) => {
    await deleteDeviceById(req.params.id);
});

module.exports = router;