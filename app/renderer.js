const marked = require('marked');
const { remote, ipcRenderer } = require('electron');
const path = require('path');

const mainProcess = remote.require('./main.js');

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

ipcRenderer.on('file-opened', (event, file, content) => {
    filePath = file;
    originalContent = content;
    markdownView.innerHTML = content;
    renderMarkdownToHtml(content);
    updateUserInterface(false);
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
