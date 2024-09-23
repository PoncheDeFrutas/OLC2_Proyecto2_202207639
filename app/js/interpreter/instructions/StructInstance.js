import { AbstractInstance } from "./AbstractInstance.js";
import { Environment } from "../environment.js";
import { Struct } from "./Struct.js";
import { ArrayList } from "./ArrayList.js";
import { Literal } from "../../ast/nodes.js";
import { LocationError } from "../../reports/Errors.js";

/**
 * Represents an instance of a structure, holding its properties and allowing access to them.
 *
 * @extends AbstractInstance
 */
export class StructInstance extends AbstractInstance {
    /**
     * Creates an instance of StructInstance.
     *
     * @param {Struct} classInstance - The structure class this instance belongs to.
     * @param {Environment} environment - The environment holding the instance properties.
     */
    constructor(classInstance, environment) {
        super(classInstance, new Environment(environment));
    }

    /**
     * Sets a property of the struct instance.
     *
     * @override
     * @param {string} name - The name of the property to set.
     * @param {*} value - The value to assign to the property.
     * @param {Object} location - The location where the assignment is performed.
     */
    set(name, value, location) {
        this.properties.assign(name, value, location);
    }

    /**
     * Gets a property of the struct instance.
     *
     * @override
     * @param {string} name - The name of the property to retrieve.
     * @param {Object} location - The location from which the property is accessed.
     * @returns {*} - The value of the property.
     */
    get(name, location) {
        return this.properties.get(name, location);
    }

    /**
     * Creates a deep copy of the StructInstance.
     *
     * @returns {StructInstance} - A new instance that is a deep copy of the current one.
     */
    clone() {
        // Implement cloning logic if necessary.
        // Note: You should call super.clone() if `AbstractInstance` has a meaningful `clone` implementation.
        return new StructInstance(this.classInstance, this.properties.clone());
    }
}

/**
 * Represents an instance of an ArrayList, holding its elements and allowing access to them.
 *
 * @extends AbstractInstance
 */
export class ArrayListInstance extends AbstractInstance {
    /**
     * Creates an instance of ArrayListInstance.
     *
     * @param {ArrayList} classInstance - The ArrayList class this instance belongs to.
     * @param {Literal} arrayList - The list of literals representing the array elements.
     */
    constructor(classInstance, arrayList) {
        super(classInstance, arrayList);
    }

    /**
     * Sets a value at a specific index in the ArrayList instance.
     *
     * @override
     * @param {Literal} index - The index of the element to set.
     * @param {*} value - The value to assign.
     * @param {Object} location - The location where the assignment is performed.
     * @throws {LocationError} - If the index is not valid or out of bounds.
     */
    set(index, value, location) {
        if (!(index instanceof Literal)) {
            throw new LocationError('Index must be a literal', location);
        }
        if (index.type !== 'int') {
            throw new LocationError('Index must be a number', location);
        }
        if (index.value < 0 || index.value >= this.properties.length) {
            throw new LocationError('Index out of bounds', location);
        }
        this.properties[index.value] = value;
    }

    /**
     * Gets a value at a specific index in the ArrayList instance or its length.
     *
     * @override
     * @param {Literal} index - The index of the element to get or a special key ("length").
     * @param {Object} location - The location from which the value is accessed.
     * @returns {*} - The value at the specified index or the length of the ArrayList.
     * @throws {LocationError} - If the index is not valid or out of bounds.
     */
    get(index, location) {
        if (index === "length") {
            return new Literal({ value: this.properties.length, type: "int" });
        }

        if (!(index instanceof Literal)) {
            throw new LocationError('Index must be a Literal', location);
        }
        if (index.type !== 'int') {
            throw new LocationError('Index must be a number', location);
        }
        if (index.value < 0 || index.value >= this.properties.length) {
            throw new LocationError('Index out of bounds', location);
        }

        return this.properties[index.value];
    }

    /**
     * Creates a deep copy of the ArrayListInstance.
     *
     * @returns {ArrayListInstance} - A new instance that is a deep copy of the current one.
     */
    clone() {
        // Implement cloning logic if necessary.
        // Note: You should call super.clone() if `AbstractInstance` has a meaningful `clone` implementation.
        return new ArrayListInstance(this.classInstance, this.properties.map(item => item.clone()));
    }
}
