const { app, autoUpdater, dialog } = require('electron');

const baseURL = 'http://127.0.0.1:8888';

const platform = process.platform;
const currentVersion = app.getVersion();

const releaseFeed = `${baseURL}/fire-sale/releases/${platform}?version=${currentVersion}`;

console.log(`[AutoUpdater] Setting release feed to ${releaseFeed}`);
autoUpdater.setFeedURL({
    url: releaseFeed
});

autoUpdater.on('error', (error) => {
    console.error(error);
});

autoUpdater.on('update-available', () => {
    console.log('update-available');
});

autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
        type: 'question',
        buttons: ['Install & Relaunch', 'Not Now'],
        title: 'Application Update',
        defaultId: 0,
        message: `${app.name} has been updated!`,
        detail: 'An update has been downloaded and can be installed now.'
    }).then(res => {
        if(res.response === 0) {
            autoUpdater.quitAndInstall();
        }
    });
});

module.exports = autoUpdater;
