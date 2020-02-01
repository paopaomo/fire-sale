const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const windows = new Set();
const openFiles = new Map();

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
        stopWatchingFile(newWindow);
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
    app.addRecentDocument(file);
    targetWindow.setRepresentedFilename(file);
    startWatchingFile(targetWindow, file);
};

const saveHTML = (targetWindow, content) => {
  dialog.showSaveDialog(targetWindow, {
      title: 'Save HTML',
      defaultPath: app.getPath('documents'),
      filters: [
          { name: 'HTML Files', extensions: ['html', 'htm'] }
      ]
  }).then(response => {
      const { canceled, filePath } = response;
      if(!canceled) {
          fs.writeFileSync(filePath, content);
      }
  })
};

const saveMarkdown = (targetWindow, file, content) => {
    if(file) {
        fs.writeFileSync(file, content);
        targetWindow.webContents.send('save-existed-file', file, content);
        return;
    }
    dialog.showSaveDialog(targetWindow, {
        title: 'Save Markdown',
        defaultPath: app.getPath('documents'),
        filters: [
            { name: 'Markdown Files', extensions: ['markdown', 'md'] }
        ]
    }).then(response => {
        const { canceled, filePath } = response;
        if(!canceled) {
            fs.writeFileSync(filePath, content);
            app.addRecentDocument(filePath);
            targetWindow.setRepresentedFilename(filePath);
            targetWindow.webContents.send('save-new-file', filePath, content);
        }
    })
};

const stopWatchingFile = (targetWindow) => {
    if(openFiles.has(targetWindow)) {
        openFiles.get(targetWindow).close();
        openFiles.delete(targetWindow);
    }
};

const startWatchingFile = (targetWindow, file) => {
    stopWatchingFile(targetWindow);

    const watcher = fs.watch(file, (eventType) => {
        const content = fs.readFileSync(file).toString();
        targetWindow.webContents.send('file-opened', file, content);
    });

    openFiles.set(targetWindow, watcher);
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

app.on('will-finish-launching', () => {
    app.on('open-file', (event, file) => {
        const win = createWindow();
        openFile(win, file);
    });
});

module.exports = { getFileFromUser, createWindow, saveHTML, saveMarkdown, openFile };
