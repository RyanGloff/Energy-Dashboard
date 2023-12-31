const { startCollectingUsage } = require('./kasaControl.js');
const { postLog, postError, getSpaceUsed } = require('./pg/pgTools.js');
const { purgeOldEmeterData } = require('./pg/emeter.js');
const { getDevices } = require('./pg/devices.js');
const { startApiEndpoints } = require('./api/apiEndpoints.js');
const { injestEmeterData } = require('./services/emeterDataIngester.js');

async function main() {
  if (process.argv.indexOf('--no-polling') === -1) {
    startCollectingUsage({
        devices: (await getDevices()).map(d => d.alias),
        pollRate: 5000,
        cb: injestEmeterData,
        err: postError
    });

    // Periodically purge the old data to keep it from filling up drive
    setInterval(() => {
      purgeOldEmeterData(31)
        .then(remainingRecords => postLog(`There are ${remainingRecords} remaining`, 'Emeter Data Purge'));
    }, 1000 * 60 * 60); // Once an hour

    // Periodically print out space used
    setInterval(() => {
      getSpaceUsed()
        .then(used => postLog(`Used space: ${used}`, 'Allocated Space'));
    }, 1000 * 60 * 60 /* Once an hour */);
  }

  // Start API
  startApiEndpoints(8080);
}

main();