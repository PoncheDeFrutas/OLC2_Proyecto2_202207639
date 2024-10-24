import { Environment } from "../environment.js";

/**
 * Represents an instance of a class or data structure with associated properties.
 */
export class Instance {

    /**
     * Creates an instance of the `Instance` class.
     *
     * @param {Struct | ArrayList} classInstance - The class instance associated with this `Instance`.
     * @param {Environment | Array} properties - The properties associated with this `Instance`.
     */
    constructor(classInstance) {
        this.classInstance = classInstance;
        this.properties = new Environment(classInstance.closure);
    }

    /**
     * Sets the value of a property in this `Instance`.
     *
     * @param {string | number} name - The name of the property to set.
     * @param {*} value - The value to assign to the property.
     * @param {Object} location - The location information for error reporting.
     */
    set(name, value, location) {
        this.properties.assign(name, value, location);
    }

    /**
     * Gets the value of a property from this `Instance`.
     *
     * @param {string | number} name - The name of the property to retrieve.
     * @param {Object} location - The location information for error reporting.
     * @returns {*} The value of the property.
     */
    get(name, location) {
        return this.properties.get(name, location);
    }
}
