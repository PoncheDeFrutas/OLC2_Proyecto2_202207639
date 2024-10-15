import { Literal } from '../../ast/nodes.js';
import { LocationError } from "../../reports/Errors.js";

/**
 * Performs a logical operation between two literals of type 'bool'.
 *
 * @param {string} op - The logical operator ('&&' for logical AND, '||' for logical OR).
 * @param {Literal} left - The left operand of the logical operation, which must be of type 'bool'.
 * @param {Literal} right - The right operand of the logical operation, which must be of type 'bool'.
 * @param {Object} location - The location information for error reporting.
 * @returns {Literal} The result of the logical operation as a new Literal object of type 'bool'.
 * @throws {LocationError} If either operand is null, if operand types are not 'bool', or if an unsupported operator is used.
 */
export function LogicalOperation(op, left, right, location) {

    if (left.value === null || right.value === null) {
        throw new LocationError(`Cannot perform logical operation with null values.`, location);
    }

    if (left.type !== 'bool' || right.type !== 'bool') {
        throw new LocationError(`Invalid operand types: ${left.type} and ${right.type}. Both operands must be of type 'bool'.`, location);
    }

    switch (op) {
        case '&&':
            return new Literal({ value: left.value && right.value, type: 'bool' });
        case '||':
            return new Literal({ value: left.value || right.value, type: 'bool' });
        default:
            throw new LocationError(`Unsupported logical operator: ${op}`, location);
    }
}
