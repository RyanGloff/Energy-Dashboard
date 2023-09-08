const { Client } = require('tplink-smarthome-api');

const client = new Client();

function log(str) {
    console.log(`[KasaControl] ${str}`);
}

/**
 * @param {Object} options - Options
 * @param {String[]} options.devices - Array of device alias names
 * @param {Number} [options.pollRate=5000] - How often to poll the emeter data in MS
 * @param {Number} [options.persistenceDays=7] - How long to store data in days (default is 1 week)
 * @param {Function} [options.cb] - Callback to process emeter data (String -> deviceAlias, Object -> data)
 * @param {Function} [options.err] - Callback to process errors (String -> errorType, Object -> err)
 */
async function startCollectingUsage(options) {
    // Input validation
    if (options == undefined) {
        throw new Error(`Options must be defined`);
    }
    if (!(options.hasOwnProperty('devices') 
            && options.devices.constructor === Array
            && options.devices.every(v => typeof v === 'string'))) {
        throw new Error(`Options.devices must be an Array of Strings`);
    }
    if (options.hasOwnProperty('pollRate')) {
        if (!(typeof options.pollRate === 'number' && options.pollRate % 1 === 0 && options.pollRate > 0)) { // ensure pollRate is a whole number greater than 0
            throw new Error(`Options.pollRate was defined with an invalid value. Options.pollRate must be a whole number greater than 0. Value was: ${options.pollRate}`);
        } else {
            log(`Options.pollRate was overriden to a value of ${options.pollRate}`)
        }
    } else {
        options.pollRate = 5000;
        log(`Options.pollRate defaulted to ${options.pollRate}`);
    }

    const devicesMIA = [... options.devices];
    const devicesToPoll = [];
    let pollWorker = null;

    // Defined listeners for discovery process
    client.on('plug-new', plug => {
        if (options.devices.some(e => plug.alias === e)) {
            log(`Device found with alias: ${plug.alias}`);
            devicesToPoll.push(plug);
            
            // Remove from MIA list
            const index = devicesMIA.indexOf(plug.alias);
            if (index >= 0) devicesMIA.splice(index, 1);

            // Start polling if not already running
            if (pollWorker === null) {
                log('Creating pollWorker');
                pollWorker = setInterval(() => {
                    devicesToPoll.forEach(device => {
                        device.emeter.getRealtime().then((res, err) => {
                            let metrics = {
                                currentMA: res.current_ma,
                                voltageMV: res.voltage_mv,
                                powerMW: res.power_mw,
                                totalWH: res.total_wh
                            }
                            options.cb(device.alias, metrics);
                        })
                        .catch(err => options.err('emeter getRealtime', device.alias, err))
                    });
                }, options.pollRate);
            }

            // If devicesMIA is empty stop discovery
            if (devicesMIA.length === 0) {
                log('All devices found. Halting discovery.')
                client.stopDiscovery();
            }
        }
    });

    // Start discovery
    log('Starting discovery');
    client.startDiscovery();

}

module.exports = { startCollectingUsage };