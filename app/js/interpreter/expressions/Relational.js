import { Literal } from '../../ast/nodes.js';
import { LocationError } from "../../reports/Errors.js";

/**
 * Performs a relational operation between two literals.
 *
 * @param {string} op - The relational operator ('<', '>', '<=', '>=', '==', '!=').
 * @param {Literal} left - The left operand of the relational operation.
 * @param {Literal} right - The right operand of the relational operation.
 * @param {Object} location - The location information for error reporting.
 * @returns {Literal} The result of the relational operation as a new Literal object of type 'bool'.
 * @throws {LocationError} If either operand is null, if operand types are invalid for the operation, or if an unsupported operator is used.
 */
export function RelationalOperation(op, left, right, location) {

    if (left.value === null || right.value === null) {
        throw new LocationError(`Cannot perform relational operation with null values.`, location);
    }

    const rules = OperationRules[op];
    const accepted = rules.find(([tl, tr]) => tl === left.type && tr === right.type);

    if (!accepted) {
        throw new LocationError(`Invalid operand types: ${left.type} and ${right.type}`, location);
    }

    const resultType = accepted[2];

    const operations = {
        '<': (a, b) => a < b,
        '>': (a, b) => a > b,
        '<=': (a, b) => a <= b,
        '>=': (a, b) => a >= b,
        '==': (a, b) => a === b,
        '!=': (a, b) => a !== b,
    };

    if (!(op in operations)) {
        throw new LocationError(`Operator ${op} not implemented`, location);
    }

    const result = operations[op](left.value, right.value);
    return new Literal({ value: result, type: resultType });
}

/**
 * Creates common rules for relational operations between types.
 *
 * @returns {Array<Array<string>>} A list of rules for type compatibility in relational operations.
 */
function createCommonRules() {
    return [
        ['int', 'int', 'bool'],
        ['int', 'float', 'bool'],
        ['float', 'int', 'bool'],
        ['float', 'float', 'bool'],
        ['char', 'char', 'bool']
    ];
}

/**
 * A map defining the operation rules for each relational operator.
 *
 * @type {Object<string, Array<Array<string>>>}
 */
const OperationRules = {
    '<': createCommonRules(),
    '>': createCommonRules(),
    '<=': createCommonRules(),
    '>=': createCommonRules(),
    '==': [
        ...createCommonRules(),
        ['string', 'string', 'bool'],
        ['bool', 'bool', 'bool'],
    ],
    '!=': [
        ...createCommonRules(),
        ['string', 'string', 'bool'],
        ['bool', 'bool', 'bool'],
    ],
};
