const { crashReporter } = require('electron');
const axios = require('axios');
const manifest = require('../package');

const host = 'http://localhost:8888';

const config = {
  productName: 'Fire Sale',
  companyName: 'Electron in Action',
  submitURL: `${host}/crash`
};

const init = () => {
    crashReporter.start(config);
    console.log('[INFO] Crash reporting started', crashReporter);
};

const sendUncaughtException = (err) => {
    const { productName, companyName } = config;
    axios.post(`${host}/uncaughtexceptions`, {
        _productName: productName,
        _companyName: companyName,
        _version: manifest.version,
        platform: process.platform,
        process_type: process.type,
        ver: process.versions.electron,
        error: {
            message: err.error.message,
            stack: err.error.stack
        }
    });
};

module.exports = { init, sendUncaughtException };
