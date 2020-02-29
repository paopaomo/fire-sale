const { crashReporter } = require('electron');

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

module.exports = {init};
