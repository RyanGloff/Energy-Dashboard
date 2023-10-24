const { postEmeterData } = require('../pg/emeter.js');

async function injestEmeterData(alias, data) {
    const post = {
        timestamp: new Date(),
        alias,
        ... data
    };
    await postEmeterData(post);
}

module.exports = {
    injestEmeterData
};