const { Client } = require('pg');

let client = null;

async function ensureClient() {
    if (client !== null) return;
    client = new Client({
        user: 'energy-dashboard-app-user',
        host: 'localhost',
        database: 'emeter-data',
        password: 'password',
        port: 5432
    });
    await client.connect();
}

async function grabClient() {
    await ensureClient();
    return client;
}

module.exports = { grabClient };