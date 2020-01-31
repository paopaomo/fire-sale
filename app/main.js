const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow = null;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.webContents.loadFile(path.join(__dirname, 'index.html'));
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});
