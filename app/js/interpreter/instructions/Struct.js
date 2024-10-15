import { Invocable } from "../expressions/Invocable.js";
import { StructDeclaration } from "../../ast/nodes.js";
import { StructInstance } from "./StructInstance.js";

/**
 * Represents a structure (or class) in the system, allowing for the creation of structured instances.
 *
 * @extends Invocable
 */
export class Struct extends Invocable {

    /**
     * Creates an instance of Struct.
     *
     * @param {StructDeclaration} node - The structure declaration node.
     * @param {Environment} closure - The environment in which the structure was declared.
     */
    constructor(node, closure) {
        super();

        /** @type {StructDeclaration} */
        this.node = node;

        /** @type {Environment} */
        this.closure = closure;
    }

    /**
     * Returns the number of parameters the structure expects (typically 0 for structures).
     *
     * @returns {number} - The number of parameters (usually 0).
     */
    arity() {
        // Structures typically don't have a notion of arity like functions.
        // This method can be left unimplemented or adjusted based on the context.
    }

    /**
     * Creates an instance of the structure with the provided arguments.
     *
     * @param {Interpreter} interpreter - The interpreter instance.
     * @param {Array<Literal>} args - The arguments to initialize the structure instance.
     * @returns {StructInstance} - The newly created structure instance.
     */
    invoke(interpreter, args) {
        const actEnvironment = interpreter.Environment;
        const newInstance = new StructInstance(this, this.closure);
        interpreter.Environment = newInstance.properties;

        // Initialize fields of the structure
        this.node.fields.forEach(field => field.accept(interpreter));

        // Initialize structure instance with provided arguments
        args.forEach(arg => arg.accept(interpreter));

        // Reset previous environment reference in the instance
        newInstance.properties.prev = null;

        // Restore the original environment
        interpreter.Environment = actEnvironment;
        return newInstance;
    }
}
