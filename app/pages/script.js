let editor;
let tabs = [];
let currentTabIndex = 0;

require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.33.0/min/vs' } });
require(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(document.getElementById('monaco-editor'), {
        value: '',
        language: 'java',
        theme: 'vs-dark'
    });
    createNewTab();
});

/**
 * Creates a new tab in the editor.
 * @param {string} [tabName] - The name of the new tab.
 */
function createNewTab(tabName) {
    if (tabs.length >= 15) {
        alert('Cannot open more than 15 tabs.');
        return;
    }

    if (tabs[currentTabIndex]) {
        tabs[currentTabIndex].content = editor.getValue();
    }

    const tabId = tabs.length;

    if (typeof tabName !== 'string') {
        tabName = `Tab ${tabId + 1}`;
    }

    const newTab = {
        id: tabId,
        title: tabName,
        content: ''
    };

    tabs.push(newTab);
    currentTabIndex = tabId;

    const newTabButton = document.createElement('div');
    newTabButton.classList.add('tab-btn', 'd-flex', 'align-items-center', 'mx-1');
    newTabButton.setAttribute('data-id', tabId);

    const tabTitle = document.createElement('span');
    tabTitle.innerText = newTab.title;
    tabTitle.onclick = () => changeTab(tabId); 
    tabTitle.style.cursor = 'pointer';

    const closeButton = document.createElement('span');
    closeButton.innerText = '×';  
    closeButton.classList.add('close-btn', 'ms-2');
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = (e) => {
        e.stopPropagation(); 
        closeTab(tabId);
    };

    newTabButton.appendChild(tabTitle);
    newTabButton.appendChild(closeButton);

    document.getElementById('tabs-container').appendChild(newTabButton);

    changeTab(tabId, true);
}


/**
 * Changes the current tab in the editor.
 * @param {number} tabId - The ID of the tab to switch to.
 * @param {boolean} [isNewTab=false] - Whether the tab is newly created.
 */
function changeTab(tabId, isNewTab = false) {
    if (tabs[currentTabIndex]) {
        tabs[currentTabIndex].content = editor.getValue();
    }

    currentTabIndex = tabId;

    if (isNewTab) {
        editor.setValue('');
    } else {
        editor.setValue(tabs[tabId].content);
    }

    editor.layout();
    updateActiveTabUI();
}

/**
 * Updates the UI to reflect the active tab.
 */
function updateActiveTabUI() {
    const tabButtons = document.getElementById('tabs-container').children;

    Array.from(tabButtons).forEach(button => {
        button.classList.remove('tab-active');
    });

    tabButtons[currentTabIndex].classList.add('tab-active');
}

/**
 * Renames the current tab.
 * @param {string} newTitle - The new title for the tab.
 */
function renameCurrentTab(newTitle) {
    tabs[currentTabIndex].title = newTitle;

    const tabButtons = document.getElementById('tabs-container').childNodes;
    tabButtons[currentTabIndex].innerText = newTitle;
}

/**
 * Closes the current tab.
 */
function closeTab(tabId) {
    if (tabs.length <= 1) {
        alert('Cannot close the last tab.');
        return;
    }

    // Elimina la pestaña de la lista
    tabs.splice(tabId, 1);

    // Elimina el botón de la pestaña correspondiente
    const tabButtons = document.getElementById('tabs-container').children;
    tabButtons[tabId].remove();

    // Reasigna las IDs de las pestañas y ajusta la interfaz de usuario
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].id = i; // Actualiza el ID en la lista de tabs
        tabButtons[i].setAttribute('data-id', i);
        tabButtons[i].querySelector('span').innerText = tabs[i].title;
    }

    // Ajusta el índice de la pestaña actual
    currentTabIndex = Math.min(currentTabIndex, tabs.length - 1);
    changeTab(currentTabIndex); // Cambia a la pestaña anterior o siguiente
}

document.getElementById('new-tab').addEventListener('click', createNewTab);

document.getElementById('load-file').addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.oak';

    fileInput.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                const fileName = file.name.replace('.oak', '');

                createNewTab(fileName);
                editor.setValue(content);
            };
            reader.readAsText(file);
        }
    };

    fileInput.click();
});

document.getElementById('save-file').addEventListener('click', () => {
    const currentContent = editor.getValue();
    const currentTitle = tabs[currentTabIndex].title;
    const blob = new Blob([currentContent], { type: 'text/plain' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${currentTitle}.oak`;
    link.click();
});

document.getElementById('rename-tab').addEventListener('click', () => {
    const newName = prompt('Enter the new tab name:');
    if (newName) {
        renameCurrentTab(newName);
    }
});

const leftPane = document.getElementById('left-pane');
const rightPane = document.getElementById('right-pane');
const dragBar = document.getElementById('drag-bar');
let isDragging = false;

dragBar.addEventListener('mousedown', () => {
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
