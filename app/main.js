const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const windows = new Set();

const createWindow = () => {
    let newWindow = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    newWindow.webContents.loadFile(path.join(__dirname, 'index.html'));
    newWindow.once('ready-to-show', () => {
        newWindow.show();
    });
    newWindow.on('closed', () => {
        windows.delete(newWindow);
        newWindow = null;
    });
    windows.add(newWindow);
    return newWindow;
};

const getFileFromUser = (targetWindow) => {
  dialog.showOpenDialog(targetWindow, {
      properties: ['openFile'],
      filters: [
          { name: 'Markdown Files', extensions: ['md', 'markdown', 'txt'] }
      ]
  }).then(response => {
      const { canceled, filePaths } = response;
      if(!canceled) {
          openFile(targetWindow, filePaths[0]);
      }
  })
};

const openFile = (targetWindow, file) => {
    const content = fs.readFileSync(file).toString();
    targetWindow.webContents.send('file-opened', file, content);
};

app.on('ready', () => {
    createWindow();
});

module.exports = { getFileFromUser, createWindow };
