const express = require('express');

const deviceRouter = require('./routers/devices.js');
const emeterRouter = require('./routers/emeter.js');

function log(str) {
    console.log(`[ApiEndpoints] ${str}`);
}

function startApiEndpoints(port) {
    const app = express();

    app.use('/devices', deviceRouter);
    app.use('/emeter', emeterRouter);

    app.use('/', express.static('ui/public'));

    app.listen(port, () => {
        log(`Api Endpoint server started on port: ${port}`);
    });
}

module.exports = { startApiEndpoints };