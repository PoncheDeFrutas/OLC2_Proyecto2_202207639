import { Literal } from "../../ast/nodes.js";

/**
 * Exception used to signal a break in loop control.
 */
export class BreakException extends Error {
    constructor() {
        super('Break');
        this.name = 'BreakException';
    }
}

/**
 * Exception used to signal a continue in loop control.
 */
export class ContinueException extends Error {
    constructor() {
        super('Continue');
        this.name = 'ContinueException';
    }
}

/**
 * Exception used to signal a return from a function.
 *
 * @extends Error
 */
export class ReturnException extends Error {
    /**
     * Creates an instance of ReturnException.
     *
     * @param {Literal} value - The value to be returned from the function.
     */
    constructor(value) {
        super('Return');
        this.name = 'ReturnException';
        this.value = value;
    }
}
