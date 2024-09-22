function executeCode() {
    const code = editor.getValue();

    try {
        console.log(code);
    } catch (error) {
        console.error("Error ejecutando el código:", error);
        alert("Error ejecutando el código: " + error.message);
    }
}

document.getElementById('run-code').addEventListener('click', executeCode);
