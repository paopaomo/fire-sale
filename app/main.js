const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const windows = new Set();

const createWindow = () => {
    let x, y;
    const currentWindow = BrowserWindow.getFocusedWindow();
    if(currentWindow) {
        const [currentWindowX, currentWindowY] = currentWindow.getPosition();
        x = currentWindowX + 10;
        y = currentWindowY + 10;
    }
    let newWindow = new BrowserWindow({
        x,
        y,
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
    targetWindow.setRepresentedFilename(file);
};

app.on('ready', () => {
    createWindow();
});

app.on('window-all-closed', () => {
    if(process.platform === 'darwin') {
        return false;
    }
    app.quit();
});

app.on('activate', (event, hasVisibleWindows) => {
    if(!hasVisibleWindows) {
        createWindow();
    }
});

module.exports = { getFileFromUser, createWindow };
