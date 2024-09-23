import { ArrayListInstance } from "./StructInstance.js";
import { Literal } from "../../ast/nodes.js";
import { Invocable } from "../expressions/Invocable.js";

/**
 * Represents an ArrayList, which is an invocable entity capable of creating and managing arrays.
 * @extends Invocable
 */
export class ArrayList extends Invocable {

    /**
     * Creates an instance of ArrayList.
     *
     * @param {ArrayListInstance} node - The ArrayListInstance associated with this ArrayList.
     * @param {Array<any>} args - The arguments provided to this ArrayList.
     */
    constructor(node, args) {
        super();
        /** @type {ArrayListInstance} */
        this.node = node;
        /** @type {Array<any>} */
        this.args = args;
    }

    /**
     * Returns the number of arguments required by this ArrayList.
     * This method should be implemented by subclasses.
     *
     * @returns {number} The arity (number of arguments) required.
     */
    arity() {
        // Implementation needed
    }

    /**
     * Invokes this ArrayList with the given arguments.
     * Creates a new instance of ArrayList or retrieves an array based on the node configuration.
     *
     * @param {InterpreterVisitor} interpreter - The interpreter instance managing the execution context.
     * @param {Array<any>} args - The arguments to pass to the ArrayList.
     * @returns {ArrayListInstance} A new instance of ArrayList or an array.
     */
    invoke(interpreter, args) {
        const node = this.node;
        if (node.dim && node.type) {
            const result = this.createDefaultArray(node.type, node.dim);
            console.log(result);
            this.node.type = node.type + '[]'.repeat(node.dim.length);
            return result;
        }
        if (node.args) {
            const result = this.getArray(interpreter);
            console.log(result);
            return result;
        }
    }

    /**
     * Gets the default value for a given type.
     *
     * @param {string} type - The type for which to retrieve the default value.
     * @returns {Literal} A Literal object representing the default value for the given type.
     */
    getDefaultValue(type) {
        const defaultValues = {
            int: new Literal({ value: 0, type: "int" }),
            float: new Literal({ value: 0.0, type: "float" }),
            bool: new Literal({ value: false, type: "bool" }),
            string: new Literal({ value: '', type: "string" }),
            char: new Literal({ value: '', type: "char" })
        };

        return defaultValues[type] !== undefined ? defaultValues[type] : new Literal({ value: null, type: type });
    }

    /**
     * Creates a default array with the specified type and dimensions.
     *
     * @param {string} type - The type of the array elements.
     * @param {Array<Literal>} dim - The dimensions of the array.
     * @returns {ArrayListInstance} A new ArrayListInstance with default values.
     */
    createDefaultArray(type, dim) {
        if (dim.length === 1) {
            const literalArray = Array.from({ length: dim[0].value }, () => this.getDefaultValue(type));
            return new ArrayListInstance(null, literalArray);
        } else {
            const literalsArray = Array.from({ length: dim[0].value }, () =>
                new Literal({
                    type: type + '[]'.repeat(dim.length - 1),
                    value: this.createDefaultArray(type, dim.slice(1))
                })
            );
            return new ArrayListInstance(null, literalsArray);
        }
    }

    /**
     * Retrieves an array based on the node arguments and updates the node type.
     *
     * @param {InterpreterVisitor} interpreter - The interpreter instance managing the execution context.
     * @returns {ArrayListInstance} A new ArrayListInstance with evaluated values.
     */
    getArray(interpreter) {
        const result = this.node.args.map(exp => {
            if (exp != null) {
                return exp.accept(interpreter);
            }
            return null;
        });

        if (this.node.type === undefined) {
            this.node.type = result[0].type + '[]';
        } else {
            this.node.type += '[]';
        }

        return new ArrayListInstance(null, result);
    }
}
