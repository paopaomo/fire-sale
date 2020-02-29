const marked = require('marked');
const { remote, ipcRenderer, shell } = require('electron');
const path = require('path');

const mainProcess = remote.require('./main.js');
const { Menu } = remote;

const markdownView = document.getElementById('markdown');
const htmlView = document.getElementById('html');
const newFileButton = document.getElementById('new-file');
const openFileButton = document.getElementById('open-file');
const saveMarkdownButton = document.getElementById('save-markdown');
const revertButton = document.getElementById('revert');
const saveHtmlButton = document.getElementById('save-html');
const showFileButton = document.getElementById('show-file');
const openInDefaultButton = document.getElementById('open-in-default');

const currentWindow = remote.getCurrentWindow();
let filePath = '';
let originalContent = '';

require('./crash-report').init();

const createContextMenu = () => {
    return Menu.buildFromTemplate([
        {
            label: 'Open file',
            click() {
                mainProcess.getFileFromUser(currentWindow);
            }
        },
        {
            label: 'Show File',
            click: showFile,
            enabled: !!filePath
        },
        {
            label: 'Open in Default Editor',
            click: openInDefaultApplication,
            enabled: !!filePath
        },
        {
            type: 'separator'
        },
        {
            label: 'Cut',
            role: 'cut'
        },
        {
            label: 'Copy',
            role: 'copy'
        },
        {
            label: 'Paste',
            role: 'paste'
        },
        {
            label: 'Select All',
            role: 'selectAll'
        }
    ]);
};

const renderMarkdownToHtml = (markdown) => {
    htmlView.innerHTML = marked(markdown);
};

const updateUserInterface = (isEdited) => {
    let title = 'File Sale';
    if(filePath) {
        title = `${path.basename(filePath)}-${title}`;
    }
    if(isEdited) {
        title = `${title} (Edited)`
    }
    currentWindow.setTitle(title);
    currentWindow.setDocumentEdited(isEdited);
    saveMarkdownButton.disabled = !isEdited;
    revertButton.disabled = !isEdited;
};

const getDraggedFile = (event) => event.dataTransfer.items[0];

const getDroppedFile = (event) => event.dataTransfer.files[0];

const fileTypeIsSupported = (file) => {
    return ['text/plain', 'text/markdown'].includes(file.type);
};

const renderFile = (file, content) => {
    filePath = file;
    originalContent = content;
    markdownView.value = content;
    renderMarkdownToHtml(content);
    updateUserInterface(false);
    showFileButton.disabled = false;
    openInDefaultButton.disabled = false;
};

const showFile = () => {
    if(!filePath) {
        return alert('This file has not been saved to the filesystem.');
    }
    shell.showItemInFolder(filePath);
};

const openInDefaultApplication = () => {
    if(!filePath) {
        return alert('This file has not been saved to the filesystem.');
    }
    shell.openItem(filePath);
};

markdownView.addEventListener('keyup', (e) => {
    const currentContent = e.target.value;
    renderMarkdownToHtml(currentContent);
    updateUserInterface(currentContent !== originalContent);
});

openFileButton.addEventListener('click', () => {
    mainProcess.getFileFromUser(currentWindow);
});

newFileButton.addEventListener('click', () => {
    mainProcess.createWindow();
});

saveHtmlButton.addEventListener('click', () => {
    mainProcess.saveHTML(currentWindow, htmlView.innerHTML);
});

saveMarkdownButton.addEventListener('click', () => {
    mainProcess.saveMarkdown(currentWindow, filePath, markdownView.value);
});

revertButton.addEventListener('click', () => {
    markdownView.value = originalContent;
    renderMarkdownToHtml(originalContent);
    updateUserInterface(false);
});

markdownView.addEventListener('dragover', (event) => {
    const file = getDraggedFile(event);
    if(fileTypeIsSupported(file)) {
        markdownView.classList.add('drag-over');
    } else {
        markdownView.classList.add('drag-error');
    }
});

markdownView.addEventListener('dragleave', () => {
    markdownView.classList.remove('drag-over');
    markdownView.classList.remove('drag-error');
});

markdownView.addEventListener('drop', (event) => {
    const file = getDroppedFile(event);
    if(fileTypeIsSupported(file)) {
        mainProcess.openFile(currentWindow, file.path);
    } else {
        alert('That file type is not supported');
    }
    markdownView.classList.remove('drag-over');
    markdownView.classList.remove('drag-error');
});

markdownView.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    createContextMenu().popup();
});

showFileButton.addEventListener('click', showFile);

openInDefaultButton.addEventListener('click', openInDefaultApplication);

ipcRenderer.on('file-opened', (event, file, content) => {
    if(currentWindow.isDocumentEdited()) {
        remote.dialog.showMessageBox(currentWindow, {
            type: 'warning',
            buttons: ['Yes', 'Cancel'],
            defaultId: 0,
            title: 'Overwrite Current Unsaved Changes?',
            message: 'Opening a new file in this window will overwrite your unsaved changes. Open this file anyway?',
            cancelId: 1
        }).then(response => {
            response = response.response;
            if(response === 0) {
                renderFile(file, content);
            }
        })
    } else {
        renderFile(file, content);
    }
});

ipcRenderer.on('file-changed', (event, file, content) => {
    remote.dialog.showMessageBox(currentWindow, {
        type: 'warning',
        buttons: ['Yes', 'Cancel'],
        defaultId: 0,
        title: 'Overwrite Current Unsaved Changes?',
        message: 'Another application has changed this file. Load changes?',
        cancelId: 1
    }).then(response => {
        response = response.response;
        if(response === 0) {
            renderFile(file, content);
        }
    })
});

ipcRenderer.on('save-existed-file', (event, file, content) => {
    originalContent = content;
    updateUserInterface(false);
});

ipcRenderer.on('save-new-file', (event, file, content) => {
    filePath = file;
    originalContent = content;
    updateUserInterface(false);
});

ipcRenderer.on('save-markdown', () => {
    mainProcess.saveMarkdown(currentWindow, filePath, markdownView.value);
});

ipcRenderer.on('save-html', () => {
    mainProcess.saveHTML(currentWindow, htmlView.innerHTML);
});

ipcRenderer.on('show-file', showFile);

ipcRenderer.on('open-in-default-editor', openInDefaultApplication);

document.addEventListener('dragstart', event => event.preventDefault());
document.addEventListener('dragover', event => event.preventDefault());
document.addEventListener('dragleave', event => event.preventDefault());
document.addEventListener('drop', event => event.preventDefault());

window.addEventListener('error', require('./crash-report').sendUncaughtException);
