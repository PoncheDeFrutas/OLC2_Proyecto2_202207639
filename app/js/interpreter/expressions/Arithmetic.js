import {Literal} from "../../ast/nodes.js";
import {LocationError} from "../../reports/Errors.js";

/**
 * Performs an arithmetic operation between two literals.
 *
 * @param {string} op - The arithmetic operator ('+', '-', '*', '/', '%').
 * @param {Literal} left - The left operand of the operation.
 * @param {Literal} right - The right operand of the operation.
 * @param {Object} location - The location information for error reporting.
 * @returns {Literal} The result of the arithmetic operation as a new Literal object.
 * @throws {LocationError} If any of the operands are null, if operand types are invalid, or if an unsupported operator is used.
 * @throws {Error} If the operation is not implemented.
 */
export function ArithmeticOperation(op, left, right, location) {

    if (left.value === null || right.value === null) {
        throw new LocationError(`Cannot perform arithmetic operation with null values.`, location);
    }

    const rules = OperationRules[op];

    const accepted = rules.find(([tl, tr]) => tl === left.type && tr === right.type);

    if (!accepted) {
        throw new LocationError(`Operand types are not valid: ${left.type} and ${right.type}`, location);
    }

    const resultType = accepted[2];

    if ((op === '/' || op === '%') && right.value === 0) {
        console.warn("Division by zero detected. Result is null.");
        return new LocationError({ value: null, type: 'int' });
    }

    const operations = {
        '+': (a, b) => a + b,
        '-': (a, b) => a - b,
        '*': (a, b) => a * b,
        '/': (a, b) => a / b,
        '%': (a, b) => a % b,
    };

    if (!(op in operations)) {
        throw new LocationError(`Operator ${op} not implemented`, location);
    }

    const result = operations[op](left.value, right.value);
    return new Literal({ value: result, type: resultType });
}

/**
 * Creates common rules for arithmetic operations between types.
 *
 * @returns {Array<Array<string>>} A list of rules for type compatibility in arithmetic operations.
 */
function createCommonRules() {
    return [
        ['int', 'int', 'int'],
        ['int', 'float', 'float'],
        ['float', 'int', 'float'],
        ['float', 'float', 'float']
    ];
}

/**
 * A map defining the operation rules for each arithmetic operator.
 *
 * @type {Object<string, Array<Array<string>>>}
 */
const OperationRules = {
    '+': [...createCommonRules(), ['string', 'string', 'string']],
    '-': createCommonRules(),
    '*': createCommonRules(),
    '/': createCommonRules(),
    '%': [['int', 'int', 'int']]
};
