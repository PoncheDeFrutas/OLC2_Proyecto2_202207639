export class VariableTracker {
    constructor() {
        this.variables = [];
        this.variableIdCounter = 0;
    }

    /**
     * @param {string} name
     * @param {any} value
     * @param {string} scope
     * @param {object} location
     * @returns {object|null}
     */
    track(name, value, scope, location) {
        if (this.isDuplicate(name, scope, location)) {
            return null;
        }

        const id = ++this.variableIdCounter;
        const type = typeof value;

        const line = location && location.start ? location.start.line : 'unknown';
        const column = location && location.start ? location.start.column : 'unknown';

        const variableMeta = {
            id,
            name,
            type,
            scope,
            location: {
                line,
                column
            }
        };
        this.variables.push(variableMeta);
        return variableMeta;
    }

    /**
     * @param {string} name
     * @param {string} scope
     * @param {object} location
     * @returns {boolean}
     */
    isDuplicate(name, scope, location) {
        return this.variables.some(variable =>
            variable.name === name &&
            variable.scope === scope &&
            variable.location.line === (location?.start?.line || 'unknown') &&
            variable.location.column === (location?.start?.column || 'unknown')
        );
    }

    /**
     * @returns {string}
     */
    toHtmlTable() {
        let html = '<table border="1"><thead><tr>';
        html += '<th>ID</th><th>Name</th><th>Type</th><th>Scope</th><th>Line</th><th>Column</th></tr></thead><tbody>';

        this.variables.forEach(variable => {
            html += `<tr>
                <td>${variable.id}</td>
                <td>${variable.name}</td>
                <td>${variable.type}</td>
                <td>${variable.scope}</td>
                <td>${variable.location.line}</td>
                <td>${variable.location.column}</td>
            </tr>`;
        });

        html += '</tbody></table>';
        return html;
    }
}