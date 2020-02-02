const { Menu, dialog } = require('electron');
const mainProcess = require('./main.js');

const template = [
    {
        label: 'File',
        submenu: [
            {
                label: 'New File',
                accelerator: 'CommandOrControl+N',
                click() {
                    mainProcess.createWindow();
                }
            },
            {
                label: 'Open File',
                accelerator: 'CommandOrControl+O',
                click(menuItem, focusedWindow) {
                    if(focusedWindow) {
                        return mainProcess.getFileFromUser(focusedWindow);
                    }
                    const newWindow = mainProcess.createWindow();
                    newWindow.on('show', () => {
                        mainProcess.getFileFromUser(newWindow);
                    });
                }
            },
            {
                label: 'Save File',
                accelerator: 'CommandOrControl+S',
                click(menuItem, focusedWindow) {
                    if(!focusedWindow) {
                        return dialog.showErrorBox(
                            'Cannot Save or Export',
                            'There is currently no active document to save or export'
                        );
                    }
                    focusedWindow.webContents.send('save-markdown');
                }
            },
            {
                label: 'Export HTML',
                accelerator: 'Shift+CommandOrControl+S',
                click(menuItem, focusedWindow) {
                    if(!focusedWindow) {
                        return dialog.showErrorBox(
                            'Cannot Save or Export',
                            'There is currently no active document to save or export'
                        );
                    }
                    focusedWindow.webContents.send('save-html');
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Show File',
                click(menuItem, focusedWindow) {
                    if(!focusedWindow) {
                        return dialog.showErrorBox(
                            'Cannot Show File\'s Location',
                            'There is currently no active document show.'
                        );
                    }
                    focusedWindow.webContents.send('show-file');
                }
            },
            {
                label: 'Open in Default Editor',
                click(menuItem, focusedWindow) {
                    if(!focusedWindow) {
                        return dialog.showErrorBox(
                            'Cannot Open File in Default Editor',
                            'There is currently no active document to open.'
                        );
                    }
                    focusedWindow.webContents.send('open-in-default-editor');
                }
            }
        ]
    },
    {
        label: 'Edit',
        submenu: [
            {
                label: 'Undo',
                accelerator: 'CommandOrControl+Z',
                role: 'undo'
            },
            {
                label: 'Redo',
                accelerator: 'Shift+CommandOrControl+Z',
                role: 'redo'
            },
            {
                type: 'separator'
            },
            {
                label: 'Cut',
                accelerator: 'CommandOrControl+X',
                role: 'cut'
            },
            {
                label: 'Copy',
                accelerator: 'CommandOrControl+C',
                role: 'copy'
            }, {
                label: 'Paste',
                accelerator: 'CommandOrControl+V',
                role: 'paste'
            },
            {
                label: 'Select All',
                accelerator: 'CommandOrControl+A',
                role: 'selectAll'
            }
        ]
    },
    {
        label: 'Window',
        role: 'window',
        submenu: [
            {
                label: 'Minimize',
                accelerator: 'CommandOrControl+M',
                role: 'minimize'
            },
            {
                label: 'Close',
                accelerator: 'CommandOrControl+W',
                role: 'close'
            },
            {
                type: 'separator'
            },
            {
                label: 'Bring All to Front',
                role: 'front'
            }
        ]
    },
    {
        label: 'Help',
        role: 'help',
        submenu: [
            {
                label: 'Visit Website',
                click() {}
            },
            {
                label: 'Toggle Developer Tools',
                accelerator: 'Alt+CommandOrControl+I',
                click(menuItem, focusedWindow) {
                    focusedWindow.webContents.toggleDevTools();
                }
            }
        ]
    }
];

if(process.platform === 'darwin') {
    const name = 'Fire Sale';
    template.unshift({
        label: name,
        submenu: [
            {
                label: `About ${name}`,
                role: 'about'
            },
            {
                label: 'Services',
                role: 'services',
                submenu: []
            },
            {
                label: `Hide ${name}`,
                accelerator: 'Command+H',
                role: 'hide'
            },
            {
                label: 'Hide Others',
                accelerator: 'Alt+Command+H',
                role: 'hideOthers'
            },
            {
                label: 'Show All',
                role: 'unhide'
            },
            {
                type: 'separator'
            },
            {
                label: `Quit ${name}`,
                accelerator: 'Command+Q',
                role: 'quit'
            }
        ]
    });
}

module.exports = Menu.buildFromTemplate(template);
