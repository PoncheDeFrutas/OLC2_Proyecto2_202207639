import { Invocable } from "../expressions/Invocable.js";
import { Literal } from "../../ast/nodes.js";
import { ArrayListInstance, StructInstance } from "./StructInstance.js";
import { LocationError } from "../../reports/Errors.js";

/**
 * Represents a native function that can be invoked with a specific arity.
 *
 * @extends Invocable
 */
class NativeFunction extends Invocable {
    /**
     * Creates an instance of the NativeFunction class.
     *
     * @param {number} arity - The number of arguments the function expects.
     * @param {Function} func - The function to execute when invoked.
     */
    constructor(arity, func) {
        super();
        this.arity = arity;
        this.invoke = func;
    }
}

/**
 * A collection of native functions available in the environment.
 *
 * @type {Object<string, NativeFunction>}
 */
export const Natives = {
    /**
     * Parses a string argument into an integer.
     *
     * @type {NativeFunction}
     */
    'parseInt': new NativeFunction(() => 1, (interpreter, args) => {
        if (!(args[0] instanceof Literal)) {
            throw new LocationError('Argument must be a literal', args[0].location);
        }
        if (args[0].type !== 'string') {
            throw new LocationError('Argument must be a string', args[0].location);
        }
        const value = parseInt(args[0].value);
        if (isNaN(value)) {
            throw new LocationError('Argument must be a number', args[0].location);
        }
        return new Literal({ type: 'int', value });
    }),

    /**
     * Parses a string argument into a float.
     *
     * @type {NativeFunction}
     */
    'parsefloat': new NativeFunction(() => 1, (interpreter, args) => {
        if (!(args[0] instanceof Literal)) {
            throw new LocationError('Argument must be a literal', args[0].location);
        }
        if (args[0].type !== 'string') {
            throw new LocationError('Argument must be a string', args[0].location);
        }
        const value = parseFloat(args[0].value);
        if (isNaN(value)) {
            throw new LocationError('Argument must be a number', args[0].location);
        }
        return new Literal({ type: 'float', value });
    }),

    /**
     * Converts a value to its string representation.
     *
     * @type {NativeFunction}
     */
    'toString': new NativeFunction(() => 1, (interpreter, args) => {
        if (!(args[0] instanceof Literal)) {
            throw new LocationError('Argument must be a literal', args[0].location);
        }
        if (!['string', 'int', 'float', 'bool'].includes(args[0].type)) {
            throw new LocationError('Argument must be a primitive type', args[0].location);
        }
        return new Literal({ type: 'string', value: args[0].value.toString() });
    }),

    /**
     * Converts a string to lowercase.
     *
     * @type {NativeFunction}
     */
    'toLowerCase': new NativeFunction(() => 1, (interpreter, args) => {
        if (!(args[0] instanceof Literal)) {
            throw new LocationError('Argument must be a literal', args[0].location);
        }
        if (args[0].type !== 'string') {
            throw new LocationError('Argument must be a string', args[0].location);
        }
        return new Literal({ type: 'string', value: args[0].value.toLowerCase() });
    }),

    /**
     * Converts a string to uppercase.
     *
     * @type {NativeFunction}
     */
    'toUpperCase': new NativeFunction(() => 1, (interpreter, args) => {
        if (!(args[0] instanceof Literal)) {
            throw new LocationError('Argument must be a literal', args[0].location);
        }
        if (args[0].type !== 'string') {
            throw new LocationError('Argument must be a string', args[0].location);
        }
        return new Literal({ type: 'string', value: args[0].value.toUpperCase() });
    }),

    /**
     * Returns the type of the argument as a string.
     *
     * @type {NativeFunction}
     */
    'typeof': new NativeFunction(() => 1, (interpreter, args) => {
        if (!(args[0] instanceof Literal)) {
            throw new LocationError('Argument must be a literal', args[0].location);
        }
        return new Literal({ type: 'string', value: args[0].type });
    }),

    /**
     * Prints the arguments to the console.
     *
     * @type {NativeFunction}
     */
    'System.out.println': new NativeFunction(() => 1, (interpreter, args) => {
        if (!args.length) {
            interpreter.Console += '\n';
            return null;
        }

        args.forEach(arg => {
            interpreter.Console += arg.accept(interpreter).value + '\n';
        });
    }),

    /**
     * Finds the index of a value in an ArrayList.
     *
     * @type {NativeFunction}
     */
    'indexOf': new NativeFunction(() => 2, (interpreter, args) => {
        if (!(args[0] instanceof Literal) || !(args[1] instanceof Literal)) {
            throw new LocationError('Arguments must be literals', args[0].location);
        }
        if (!(args[0].value instanceof ArrayListInstance)) {
            throw new LocationError('First argument must be an ArrayList', args[0].location);
        }

        return new Literal({
            type: 'int',
            value: args[0].value.properties.findIndex(prop => prop.value === args[1].value && prop.type === args[1].type)
        });
    }),

    /**
     * Joins the elements of an ArrayList into a string.
     *
     * @type {NativeFunction}
     */
    'join': new NativeFunction(() => 1, (interpreter, args) => {
        if (!(args[0] instanceof Literal)) {
            throw new LocationError('Argument must be a literal', args[0].location);
        }
        if (!(args[0].value instanceof ArrayListInstance)) {
            throw new LocationError('Argument must be an ArrayList', args[0].location);
        }
        return new Literal({ type: 'string', value: args[0].value.properties.map(prop => prop.value).join(',') });
    }),

    /**
     * Returns the keys of a Struct as a string array.
     *
     * @type {NativeFunction}
     */
    'Object.keys': new NativeFunction(() => 1, (interpreter, args) => {
        if (!(args[0] instanceof Literal)) {
            throw new LocationError('Argument must be a literal');
        }
        if (!(args[0].value instanceof StructInstance)) {
            throw new LocationError('Argument must be a Struct', args[0].location);
        }
        return new Literal({ type: 'string', value: `[${Object.keys(args[0].value.properties.table).join(', ')}]` });
    }),
};
