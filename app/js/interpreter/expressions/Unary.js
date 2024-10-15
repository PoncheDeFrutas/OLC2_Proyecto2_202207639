import { Literal } from "../../ast/nodes.js";
import { LocationError } from "../../reports/Errors.js";

/**
 * Performs a unary operation on a single literal.
 *
 * @param {string} op - The unary operator ('-' for negation, '!' for logical NOT).
 * @param {Literal} ext - The literal operand on which the unary operation is performed.
 * @param {Object} location - The location information for error reporting.
 * @returns {Literal} The result of the unary operation as a new Literal object.
 * @throws {LocationError} If the operand's value is null, if the operand's type is invalid for the given operator, or if the operator is not supported.
 */
export function UnaryOperation(op, ext, location) {

    if (ext.value === null) {
        throw new LocationError(`Cannot perform unary operation with null value.`, location);
    }

    const unaryOperations = {
        '-': value => {
            if (ext.type !== 'int' && ext.type !== 'float') {
                throw new LocationError(`Invalid unary operator '-' for type '${ext.type}'`, location);
            }
            return new Literal({ type: ext.type, value: -value });
        },
        '!': value => {
            if (ext.type !== 'bool') {
                throw new LocationError(`Invalid unary operator '!' for type '${ext.type}'`, location);
            }
            return new Literal({ type: 'bool', value: !value });
        }
    };

    if (!(op in unaryOperations)) {
        throw new LocationError(`Invalid unary operator '${op}'`, location);
    }

    return unaryOperations[op](ext.value);
}
