import { InterpreterVisitor } from "../../ast/interpreter.js";

/**
 * Represents an invocable entity, which can be invoked with arguments.
 * This is a base class intended to be extended by specific invocable types.
 */
export class Invocable {

    /**
     * Returns the arity (number of arguments) required by this invocable entity.
     * This method should be implemented by subclasses.
     *
     * @abstract
     * @throws {Error} Throws an error indicating that the method is not implemented.
     * @returns {number} The number of arguments required.
     */
    arity() {
        throw new Error("Invocable arity() not implemented.");
    }

    /**
     * Invokes this entity with the given arguments.
     *
     * @param {InterpreterVisitor} interpreter - The interpreter instance managing the execution context.
     * @param {Array<any>} args - The arguments to pass to the invocable entity.
     * @throws {Error} Throws an error indicating that the method is not implemented.
     * @returns {*} The result of the invocation.
     */
    invoke(interpreter, args) {
        throw new Error("Invocable invoke() not implemented.");
    }
}
