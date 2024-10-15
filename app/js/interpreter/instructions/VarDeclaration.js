import { Literal } from "../../ast/nodes.js";
import { LocationError } from "../../reports/Errors.js";

/**
 * Creates a `Literal` based on the variable declaration type and value.
 *
 * @param {string} type - The type of the variable.
 * @param {string} name - The name of the variable.
 * @param {Literal|null} value - The initial value of the variable.
 * @param {Location} location - The location in the source code where the variable is declared.
 * @returns {Literal} - The resulting `Literal` based on the type and value.
 * @throws {LocationError} - If the type is 'var' and no value is provided, or if there is a type mismatch.
 */
export function VarDeclarationF(type, name, value, location) {
    // Check if no value is provided
    if (value === null) {
        if (type === 'var') {
            throw new LocationError(`Variable declaration must have a value.`, location);
        }
        return new Literal({ value: null, type });
    }

    // Handle type conversion if needed
    if (type === 'float' && value.type === 'int') {
        return new Literal({ value: parseFloat(value.value), type: 'float' });
    }

    // Handle type matching
    if (type === 'var' || type === value.type) {
        return value;
    }

    // Type mismatch error
    return new Literal({ value: null, type });
}
