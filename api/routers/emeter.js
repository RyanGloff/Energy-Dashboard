const { Router } = require('express');
const { getEmeterDataForDeviceByAliasAtFrequency } = require('../../pg/emeter.js');

const router = Router();

const ONE_MINUTE_MS = 1000 * 60;
const ONE_HOUR_MS = ONE_MINUTE_MS * 60;
const ONE_DAY_MS = ONE_HOUR_MS * 24;
const Frequencies = {
    MINUTE: 60,
    FIVE_MINUTE: 5 * 60,
    TEN_MINUTE: 10 * 60,
    HALF_HOUR: 30 * 60 ,
    HOUR: 60 * 60,
    THREE_HOUR: 60 * 60 * 3,
    SIX_HOUR: 60 * 60 * 6,
    DAILY: 60 * 60 * 24
};

// Expose frequencies that are available for use
router.get('/frequencies', (req, res) => {
    res.json({
        options: Object.keys(Frequencies)
    });
});

router.get('/', async (req, res) => {
    const alias = req.query.alias;
    if (!alias) {
        res.status(400).send('Query must have and alias in query parameters');
        return;
    }

    let frequency = Frequencies.MINUTE;
    if (req.query.frequency) {
        const frequencyConverter = Frequencies[req.query.frequency];
        if (frequencyConverter === undefined) {
            res.status(400).send(`Invalid frequency. Choose frequency from [${Object.keys(Frequencies)}]`);
            return;
        }
        frequency = Frequencies[req.query.frequency];
    }

    let start;
    if (req.query.numDays) {
        start = new Date(Date.now() - (ONE_DAY_MS * req.query.numDays));
    } else if (req.query.numHours) {
        start = new Date(Date.now() - (ONE_HOUR_MS * req.query.numHours));
    } else {
        res.status(400).send('One of the following must be defined in query parameters: [numHours, numDays]');
        return;
    }

    // TODO: Implement start and end dates for historical data
    let end = new Date();

    const pgResult = await getEmeterDataForDeviceByAliasAtFrequency(alias, start, end, frequency);
    if (pgResult === null) {
        res.sendStatus(404);
        return;
    }
    res.json({ data: pgResult });
});

module.exports = router;