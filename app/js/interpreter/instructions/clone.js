import { Literal } from "../../ast/nodes.js";
import { ArrayListInstance } from "./StructInstance.js";

/**
 * Clones a Literal object, including its value and type.
 *
 * @param {Literal} literal - The Literal object to clone.
 * @returns {Literal} A new Literal object with the cloned value and type.
 * @throws {Error} If the provided argument is not an instance of Literal.
 */
export function cloneLiteral(literal) {
    if (!(literal instanceof Literal)) {
        throw new Error('Expected instance of Literal');
    }

    let clonedValue;

    if (Array.isArray(literal.value)) {
        clonedValue = literal.value.map(item => cloneValue(item));
    } else {
        clonedValue = cloneValue(literal.value);
    }

    return new Literal({ value: clonedValue, type: literal.type });
}

/**
 * Clones a value, handling instances of Literal, ArrayListInstance, and other types.
 *
 * @param {*} value - The value to clone.
 * @returns {*} The cloned value.
 */
function cloneValue(value) {
    if (value instanceof Literal) {
        return cloneLiteral(value);
    } else if (value instanceof ArrayListInstance) {
        return cloneArrayListInstance(value);
    } else if (Array.isArray(value)) {
        return value.map(item => cloneValue(item));
    } else {
        return JSON.parse(JSON.stringify(value));
    }
}

/**
 * Clones an ArrayListInstance object, including its class instance and properties.
 *
 * @param {ArrayListInstance} arrayListInstance - The ArrayListInstance object to clone.
 * @returns {ArrayListInstance} A new ArrayListInstance object with cloned properties.
 * @throws {Error} If the provided argument is not an instance of ArrayListInstance.
 */
function cloneArrayListInstance(arrayListInstance) {
    if (!(arrayListInstance instanceof ArrayListInstance)) {
        throw new Error('Expected instance of ArrayListInstance');
    }

    const clonedProperties = arrayListInstance.properties.map(prop => cloneValue(prop));

    return new ArrayListInstance(arrayListInstance.classInstance, clonedProperties);
}
