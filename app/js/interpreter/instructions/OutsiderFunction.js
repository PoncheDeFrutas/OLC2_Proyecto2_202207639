import { Invocable } from "../expressions/Invocable.js";
import { FuncDeclaration } from "../../ast/nodes.js";
import { Environment } from "../environment.js";
import { ReturnException } from "./Transfers.js";
import { LocationError } from "../../reports/Errors.js";

/**
 * Represents a function defined outside the current scope, with its own environment.
 *
 * @extends Invocable
 */
export class OutsiderFunction extends Invocable {

    /**
     * Creates an instance of OutsiderFunction.
     *
     * @param {FuncDeclaration} node - The function declaration node.
     * @param {Environment} closure - The environment in which the function was declared.
     */
    constructor(node, closure) {
        super();

        /** @type {FuncDeclaration} */
        this.node = node;

        /** @type {Environment} */
        this.closure = closure;
    }

    /**
     * Returns the number of parameters the function expects.
     *
     * @returns {number} - The number of parameters.
     */
    arity() {
        return this.node.params.length;
    }

    /**
     * Invokes the function with the provided arguments.
     *
     * @param {Interpreter} interpreter - The interpreter instance.
     * @param {Array<Literal>} args - The arguments to pass to the function.
     * @returns {Literal|null} - The result of the function invocation.
     * @throws {LocationError} - If there is a mismatch between the return type and the function's declared type.
     */
    invoke(interpreter, args) {
        const actEnvironment = interpreter.Environment;
        interpreter.Environment = new Environment(this.closure);
        interpreter.Environment.name = this.node.id;

        // Bind function parameters to arguments
        this.node.params.forEach((param, i) => {
            param.value = args[i];
            param.accept(interpreter);
        });

        try {
            // Execute the function's block
            this.node.block.accept(interpreter);
        } catch (error) {
            if (error instanceof ReturnException) {
                if (this.node.type === 'void' && error.value !== null) {
                    throw new LocationError('Return with a value in a void function', this.node.location);
                }

                if (this.node.type === 'var') {
                    return error.value;
                }

                if (this.node.type !== error.value.type) {
                    throw new LocationError('Return type mismatch', this.node.location);
                }

                return error.value;
            }
        } finally {
            interpreter.Environment = actEnvironment;
        }
    }
}
