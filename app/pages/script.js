require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.33.0/min/vs' } });
require(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(document.getElementById('monaco-editor'), {
        value: [
            'function helloWorld() {',
            '\tconsole.log("Hello, world!");',
            '}'
        ].join('\n'),
        language: 'java',
        theme: 'vs-dark'
    });
});

const leftPane = document.getElementById('left-pane');
const rightPane = document.getElementById('right-pane');
const dragBar = document.getElementById('drag-bar');
let isDragging = false;

dragBar.addEventListener('mousedown', (e) => {
    isDragging = true;
    document.body.style.cursor = 'ew-resize';
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const containerWidth = document.querySelector('.split-container').offsetWidth;
        const newLeftWidth = (e.clientX / containerWidth) * 100;

        if (newLeftWidth > 10 && newLeftWidth < 90) {
            leftPane.style.width = `${newLeftWidth}%`;
            rightPane.style.width = `${100 - newLeftWidth}%`;

            if (editor) {
                editor.layout();
            }
        }
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.cursor = 'default';
});

window.addEventListener('resize', () => {
    if (editor) {
        editor.layout();
    }
});
