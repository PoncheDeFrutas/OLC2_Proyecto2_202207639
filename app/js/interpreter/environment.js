/**
 * @module Environment
 */

import { LocationError} from "../reports/Errors.js";

/**
 * Class representing an environment for variable storage and lookup.
 */
export class Environment {
    /**
     * Create an environment.
     * @param {Environment|null} [parent=null] - The parent environment.
     */
    constructor(parent = null) {
        this.name = '';
        this.prev = parent;
        this.table = {};
    }

    /**
     * Set a variable in the environment.
     * @param {string} name - The name of the variable.
     * @param {any} value - The value of the variable.
     * @param {VariableTracker} tracker - The tracker for variable changes.
     * @param {Object} location - The location information for error reporting.
     * @throws {LocationError} If the variable already exists.
     */
    set(name, value, tracker, location) {
        if (this.table.hasOwnProperty(name)) {
            throw new LocationError(`Variable ${name} already exists`, location);
        }
        tracker.track(name, value, this.name, location);
        this.table[name] = value;
    }

    /**
     * Get a variable from the environment.
     * @param {string} name - The name of the variable.
     * @param {Object} location - The location information for error reporting.
     * @returns {any} The value of the variable.
     * @throws {LocationError} If the variable is not found.
     */
    get(name, location) {
        if (this.table.hasOwnProperty(name)) {
            return this.table[name];
        }

        if (this.prev) {
            return this.prev.get(name, location);
        }

        throw new LocationError(`Variable ${name} not found`, location);
    }

    /**
     * Assign a value to an existing variable in the environment.
     * @param {string} name - The name of the variable.
     * @param {any} value - The new value of the variable.
     * @param {Object} location - The location information for error reporting.
     * @throws {LocationError} If the variable is not found.
     */
    assign(name, value, location) {
        if (this.table.hasOwnProperty(name)) {
            if (this.table[name].type !== value.type) {
                this.table[name].value = null;
                return;
            }
            this.table[name] = value;
            return;
        }

        if (this.prev) {
            this.prev.assign(name, value, location);
            return;
        }

        throw new LocationError(`Variable ${name} not found`, location);
    }
}