import { Environment } from "../environment.js";
import { Struct } from "./Struct.js";
import { ArrayList } from "./ArrayList.js";
import { LocationError } from "../../reports/Errors.js";

/**
 * Represents an abstract instance that cannot be instantiated directly.
 * This class serves as a base for concrete instances like `Struct` and `ArrayList`.
 */
export class AbstractInstance {
    /**
     * Creates an instance of AbstractInstance.
     *
     * @param {Struct | ArrayList} classInstance - The class instance associated with this abstract instance.
     * @param {Environment | Literal} properties - The properties associated with this instance.
     * @throws {LocationError} If attempting to instantiate `AbstractInstance` directly.
     */
    constructor(classInstance, properties) {
        if (new.target === AbstractInstance) {
            throw new LocationError(`Cannot instantiate an abstract class.`, classInstance.node.location);
        }
        this.classInstance = classInstance;
        this.properties = properties;
    }

    /**
     * Sets a property value for the instance.
     * This method must be implemented by subclasses.
     *
     * @abstract
     * @param {string | number} name - The name of the property to set.
     * @param {*} value - The value to set for the property.
     * @param {Object} location - The location information for error reporting.
     * @returns {void}
     * @throws {Error} If not implemented by a subclass.
     */
    set(name, value, location) {
        throw new Error(`Abstract method set not implemented.`);
    }

    /**
     * Gets the value of a property from the instance.
     * This method must be implemented by subclasses.
     *
     * @abstract
     * @param {string | number} name - The name of the property to retrieve.
     * @param {Object} location - The location information for error reporting.
     * @returns {*} The value of the property.
     * @throws {Error} If not implemented by a subclass.
     */
    get(name, location) {
        throw new Error(`Abstract method get not implemented.`);
    }

    /**
     * Creates a deep copy of the instance.
     * This method must be implemented by subclasses.
     *
     * @abstract
     * @returns {AbstractInstance} A new instance that is a deep copy of the current instance.
     * @throws {Error} If not implemented by a subclass.
     */
    clone() {
        throw new Error(`Abstract method clone not implemented.`);
    }
}
