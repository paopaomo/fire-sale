const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

const getFileFromUser = () => {
  dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
          { name: 'Markdown Files', extensions: ['md', 'markdown', 'txt'] }
      ]
  }).then(response => {
      const { canceled, filePaths } = response;
      if(!canceled) {
          openFile(filePaths[0]);
      }
  })
};

const openFile = (file) => {
    const content = fs.readFileSync(file).toString();
    mainWindow.webContents.send('file-opened', file, content);
};

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

module.exports = { getFileFromUser };
