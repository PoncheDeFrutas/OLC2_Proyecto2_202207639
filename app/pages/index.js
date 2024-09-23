import { parse } from "../js/grammar/analyzer.js";
import { InterpreterVisitor } from "../js/ast/interpreter.js";

function executeCode() {
    const code = editor.getValue();

    const infoArea = document.getElementById('info-area');
    if (infoArea) {
        infoArea.value = "";
    }
    
    let errorMessages = [];
    let interpreter = new InterpreterVisitor();

    try {
        const exp = parse(code);

        for (let i = 0; i < exp.length; i++) {
            try {
                if (exp[i] !== undefined) {
                    exp[i].accept(interpreter);
                }
            } catch (error) {
                let errorMessage = `Error capturado en el elemento ${i}: ${error.message}`;
                if (error.location) {
                    errorMessage += ` at line ${error.location.start.line}, column ${error.location.start.column}`;
                }
                errorMessages.push({
                    fullMessage: errorMessage,
                    messageWithoutLocation: error.message,
                    location: error.location
                });
            }
        }
    } catch (error) {
        let errorMessage = error.message;
        if (error.location) {
            errorMessage += ` at line ${error.location.start.line}, column ${error.location.start.column}`;
        }
        errorMessages.push({
            fullMessage: errorMessage,
            messageWithoutLocation: error.message,
            location: error.location
        });
    }

    let message = "Ejecución terminada.";
    if (errorMessages.length > 0) {
        message = "Errores encontrados:\n" + errorMessages.map(e => e.fullMessage).join('\n');
    }

    const consoleOutput = interpreter?.Console || "";
    if (infoArea) {
        infoArea.value = `${consoleOutput.replace("\\n", "\n")}\n${message}\n`;
    }
}

document.getElementById('run-code').addEventListener('click', executeCode);
