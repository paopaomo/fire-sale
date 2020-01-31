const marked = require('marked');

const markdownView = document.getElementById('markdown');
const htmlView = document.getElementById('html');
const newFileButton = document.getElementById('new-file');
const openFileButton = document.getElementById('open-file');
const saveMarkdownButton = document.getElementById('save-markdown');
const revertButton = document.getElementById('revert');
const saveHtmlButton = document.getElementById('save-html');
const showFileButton = document.getElementById('show-file');
const openInDefaultButton = document.getElementById('open-in-default');

const renderMarkdownToHtml = (markdown) => {
    htmlView.innerHTML = marked(markdown, { sanitize: true });
};

markdownView.addEventListener('keyup', (e) => {
    renderMarkdownToHtml(e.target.value);
});
