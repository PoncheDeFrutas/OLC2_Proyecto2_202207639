import {BaseVisitor} from "./visitor.js";
import {Environment} from "../interpreter/environment.js";
import nodes, {Callee, Expression, Literal, Logical, Relational, VarAssign, VarDeclaration, VarValue} from "./nodes.js";
import {ArithmeticOperation} from "../interpreter/expressions/Arithmetic.js";
import {RelationalOperation} from "../interpreter/expressions/Relational.js";
import {LogicalOperation} from "../interpreter/expressions/Logical.js";
import {UnaryOperation} from "../interpreter/expressions/Unary.js";
import {VarDeclarationF} from "../interpreter/instructions/VarDeclaration.js";
import {BreakException, ContinueException, ReturnException} from "../interpreter/instructions/Transfers.js";
import {Invocable} from "../interpreter/expressions/Invocable.js";
import {Natives} from "../interpreter/instructions/NativeFunction.js";
import {OutsiderFunction} from "../interpreter/instructions/OutsiderFunction.js";
import {Struct} from "../interpreter/instructions/Struct.js";
import {AbstractInstance} from "../interpreter/instructions/AbstractInstance.js";
import {ArrayList} from "../interpreter/instructions/ArrayList.js";
import {ArrayListInstance} from "../interpreter/instructions/StructInstance.js";
import {cloneLiteral} from "../interpreter/instructions/clone.js";
import {VariableTracker} from "../reports/Symbols.js";
import {LocationError} from "../reports/Errors.js";

/**
 * InterpreterVisitor class is responsible for interpreting and executing code.
 * It manages the environment, variable tracking, and console output.
 *
 * @extends BaseVisitor
 */
export class InterpreterVisitor extends BaseVisitor {

    /**
     * Creates an instance of InterpreterVisitor.
     * Initializes the global environment, registers native functions,
     * and sets up the console output. Also manages the state of 'continue' statements.
     */
    constructor() {
        super();

        /**
         * The environment in which the code is executed.
         * Initialized as a new Environment instance with the name 'Global'.
         *
         * @type {Environment}
         */
        this.Environment = new Environment();
        this.Environment.name = 'Global';

        /**
         * Tracks variables and their metadata during execution.
         *
         * @type {VariableTracker}
         */
        this.Symbols = new VariableTracker();

        /**
         * Accumulates console output during execution.
         *
         * @type {string}
         */
        this.Console = '';

        /**
         * Registers native functions (e.g., `parseInt`, `toString`) in the environment.
         *
         * @type {void}
         */
        Object.entries(Natives).forEach(([name, func]) => {
            this.Environment.set(name, func, this.Symbols, null);
        });

        /**
         * Keeps track of the state related to 'continue' statements.
         *
         * @type {Expression|null}
         */
        this.prevContinue = null;
    }
    /**
     * @type [BaseVisitor['visitExpression']]
     */
    visitExpression(node) {
        throw new LocationError('Method visitExpression not implemented');
    }

    /**
     * @type [BaseVisitor['visitLiteral']]
     */
    visitLiteral(node) {
        return node;
    }
    
    /**
     * @type [BaseVisitor['visitArithmetic']]
     */
    visitArithmetic(node) {
        const left = node.left.accept(this);
        const right = node.right.accept(this);

        if (!(left instanceof Literal) || !(right instanceof Literal)) {
            throw new LocationError('Literal expected in arithmetic operation', node.location);
        }

        return ArithmeticOperation(node.op, left, right, node.location);
    }

    /**
     * @type [BaseVisitor['visitRelational']]
     */
    visitRelational(node) {
        const left = node.left.accept(this);
        const right = node.right.accept(this);
        
        if (!(left instanceof Literal) || !(right instanceof Literal)) {
            throw new LocationError('Literal expected in relational operation', node.location);
        }
        
        return RelationalOperation(node.op, left, right, node.location);
    }
    
    /**
     * @type [BaseVisitor['visitLogical']]
     */
    visitLogical(node) {
        const left = node.left.accept(this);
        const right = node.right.accept(this);

        if (!(left instanceof Literal) || !(right instanceof Literal)) {
            throw new LocationError('Literal expected in logical operation', node.location);
        }

        return LogicalOperation(node.op, left, right, node.location);
    }
    
    /**
     * @type [BaseVisitor['visitUnary']]
     */
    visitUnary(node) {
        if (!node) return null;

        const ext = node.exp.accept(this);

        if (!(ext instanceof Literal)) {
           throw new LocationError('Literal expected in unary operation', node.location);
        }

        return UnaryOperation(node.op, ext, node.location);
    }

    /**
     * @type [BaseVisitor['visitPrint']]
     */
    visitPrint(node) {
        if (!node) {
            this.Console += '\n';
            return null;
        }

        node.exp.forEach(exp => {
            if (exp != null) {
                const result = exp.accept(this);

                
                if (Array.isArray(result.value)) {
                    if (Array.isArray(result.value[0])) {
                        
                        result.value.forEach(row => {
                            if (Array.isArray(row)) {
                                row.forEach(item => {
                                    if (!Array.isArray(item)) {
                                        this.Console += item.accept(this).value + ' ';
                                    }
                                });
                            }
                        });
                    } else {
                        
                        result.value.forEach(item => {
                            if (!Array.isArray(item)) {
                                this.Console += item.accept(this).value + ' ';
                            }
                        });
                    }
                } else {
                    
                    this.Console += result.value + ' ';
                }
            }
        });

        this.Console += '\n';
    }

    /**
     * @type [BaseVisitor['visitBlock']]
     */
    visitBlock(node) {
        if (!node) return null;

        this.Environment = new Environment(this.Environment);

        node.stmt.forEach(statement => {
            if (statement != null) {
                statement.accept(this);
            }
        });

        this.Environment = this.Environment.prev;
    }
    
    /**
     * @type [BaseVisitor['visitIf']]
     */
    visitIf(node) {
        if (!node) return null;
        
        const condition = node.cond.accept(this);
        
        if (!(condition instanceof Literal) || condition.type !== 'bool') {
            throw new LocationError('Expected boolean expression in if statement', node.location);
        }
        
        const stmt = condition.value ? node.stmtThen : node.stmtElse
        
        if (stmt) {
            stmt.accept(this);
        }
    }

    /**
     * @type [BaseVisitor['visitCase']]
     */
    visitCase(node) {
        if (!node || !Array.isArray(node.stmt)) return null;

        node.stmt.forEach(statement => {
            if (statement) {
                statement.accept(this);
            }
        });

    }

    /**
     * @type [BaseVisitor['visitSwitch']]
     */
    visitSwitch(node) {
        if (!node) return null;

        const cond = node.cond.accept(this);

        if (!(cond instanceof Literal)) {
            throw new LocationError('Expected literal in switch statement', node.location);
        }

        let foundMatch = false;

        this.Environment = new Environment(this.Environment);

        try {
            for (const c of node.cases) {
                if (!foundMatch) {
                    const value = c.cond.accept(this);
                    foundMatch = value.value === cond.value;
                }
                if (foundMatch) {
                    c.accept(this);
                }
            }
            if (node.def && !foundMatch) {
                node.def.accept(this);
            }
        } catch (error) {
            if (!(error instanceof BreakException)) {
                throw error;
            }
        } finally {
            this.Environment = this.Environment.prev;
        }
    }
    
    /**
     * @type [BaseVisitor['visitTernary']]
     */
    visitTernary(node) {
        if (!node) return null;

        const cond = node.cond.accept(this);

        if (!(cond instanceof Literal) || cond.type !== 'bool') {
            throw new LocationError('Expected boolean expression in ternary operator', node.location);
        }

        const res = cond.value ? node.trueExp.accept(this) : node.falseExp.accept(this);

        if (!(res instanceof Literal)) {
            throw new LocationError('Literal expected in ternary operator', node.location);
        }

        return res;
    }

    /**
     * @type [BaseVisitor['visitWhile']]
     */
    visitWhile(node) {
        if (!node) return null;

        let cond = node.cond.accept(this);
        
        if (!(cond instanceof Literal) || cond.type !== 'bool') {
            throw new LocationError('Expected boolean expression in while loop', node.location);
        }
        
        if (!node.stmt){
            throw new LocationError('Expected statement in while loop', node.location);
        }

        const lastEnvironment = this.Environment
        try {
            while (node.cond.accept(this).value) {
                node.stmt.accept(this)
            }
        } catch (error) {
            this.Environment = lastEnvironment

            if (error instanceof BreakException) { return null; }
            if (error instanceof ContinueException) { return this.visitWhile(node);}

            throw error;
        }
    }

    /**
     * @type [BaseVisitor['visitFor']]
     */
    visitFor(node) {
        if (!node) return null;
        
        if (!(node.init instanceof VarDeclaration) && !(node.init instanceof VarAssign)) {
            throw new LocationError('Invalid initialization in for loop', node.location);
        }
        
        if (!(node.cond instanceof Logical) && !(node.cond instanceof Relational)) {
            throw new LocationError('Expected logical expression in for loop', node.location);
        }
        
        if (!(node.update instanceof VarAssign)) {
            throw new LocationError('Invalid update in for loop', node.location);
        }
        
        const lastIncrement = this.prevContinue;
        this.prevContinue = node.update;

        const whileNode = new nodes.Block({
            stmt: [
                node.init,
                new nodes.While({
                    cond: node.cond,
                    stmt: new nodes.Block({
                        stmt: [
                            node.stmt,
                            node.update
                        ]
                    })
                })
            ]
        })

        whileNode.accept(this);

        this.prevContinue = lastIncrement;
    }

    /**
     * @type [BaseVisitor['visitForEach']]
     */
    visitForEach(node) {
        if (!node) return null;
        
        if (!(node.vd instanceof VarDeclaration)) {
            throw new LocationError('Invalid initialization in foreach loop', node.location);
        }

        const array = node.array.accept(this);

        if (!(array instanceof Literal) || !(array.value.properties instanceof Array)) {
            throw new LocationError('Expected array in foreach loop', node.location);
        }

        const elements = array.value.properties;
        const lastEnvironment = this.Environment;
        const originalStmt = node.stmt.stmt.slice();

        try {
            for (let i = 0; i < elements.length; i++) {
                node.vd.value = elements[i];
                node.stmt.stmt.unshift(node.vd);
                node.stmt.accept(this);
                node.stmt.stmt.shift();
            }
        } catch (error) {
            this.Environment = lastEnvironment
            if (error instanceof BreakException) { return null; }
            if (error instanceof ContinueException) { return this.visitForEach(node); }
            throw error;
        } finally {
            node.stmt.stmt = originalStmt;
        }
    }
    
    /**
     * @type [BaseVisitor['visitContinue']]
     */
    visitContinue(node) {
        if (this.prevContinue) {
            this.prevContinue.accept(this);
        }
        throw new ContinueException();
    }

    /**
     * @type [BaseVisitor['visitBreak']]
     */
    visitBreak(node) {
        throw new BreakException()
    }

    /**
     * @type [BaseVisitor['visitReturn']]
     */
    visitReturn(node) {
        let value = null
        if (node.exp) {value = node.exp.accept(this)}
        throw new ReturnException(value)
    }

    /**
     * @type [BaseVisitor['visitVarDeclaration']]
     */
    visitVarDeclaration(node) {
        let value = node.value ? node.value.accept(this) : null;

        if (value) {
            if (value.value instanceof ArrayListInstance) {
                value = cloneLiteral(value);
            }
        }

        const result = VarDeclarationF(node.type, node.id, value, node.location);

        this.Environment.set(node.id, result, this.Symbols, node.location);
    }

    /**
     * @type [BaseVisitor['visitVarValue']]
     */
    visitVarValue(node) {
        return this.Environment.get(node.id, node.location);
    }

    /**
     * @type [BaseVisitor['visitVarAssign']]
     */
    visitVarAssign(node) {
        const value = node.assign.accept(this);

        if (!(value instanceof Literal)) {
            throw new LocationError('Expected literal in variable assignment', node.location);
        }

        const operations = {
            '=': () => value,
            '+=': () => ArithmeticOperation('+', this.Environment.get(node.id, node.location), value, node.location),
            '-=': () => ArithmeticOperation('-', this.Environment.get(node.id, node.location), value, node.location)
        };

        if (!(node.sig in operations)) {
            throw new LocationError(`Unsupported operation: ${node.sig}`, node.location);
        }

        const finalValue = operations[node.sig]();
        this.Environment.assign(node.id, finalValue, node.location);

        return finalValue;
    }
    
    /**
     * @type [BaseVisitor['visitGroup']]
     */
    visitGroup(node) {
        return node.exp.accept(this);
    }
    
    /**
     * @type [BaseVisitor['visitExpressionStatement']]
     */
    visitExpressionStatement(node) {
        if (!node) return null;
        node.exp.accept(this);
    }

    /**
     * @type [BaseVisitor['visitCallee']]
     */
    visitCallee(node) {
        if (!node) return null;

        const func = node.callee.accept(this);
        
        const args = node.args.map(arg => arg.accept(this));
        
        if (!(func instanceof Invocable)) {
            throw new LocationError('Expected invocable in function call', node.location);
        }
        
        if (func.arity() !== args.length) {
            throw new LocationError(`Expected ${func.arity()} arguments, got ${args.length}`, node.location);
        }
        
        return func.invoke(this, args);
    }

    /**
     * @type [BaseVisitor['visitFuncDeclaration']]
     */
    visitFuncDeclaration(node) {
        if (!node) return null;
        const func = new OutsiderFunction(node, this.Environment);
        this.Environment.set(node.id, func, this.Symbols, node.location);
    }

    /**
     * @type [BaseVisitor['visitStructDeclaration']]
     */
    visitStructDeclaration(node) {
        if (!node) return null;
        if (this.Environment.name !== 'Global') {
            throw new LocationError('Structs can only be declared in the global scope', node.location);
        }
        
        const struct = new Struct(node, this.Environment);
        this.Environment.set(node.id, struct, this.Symbols, node.location);
    }

    /**
     * @type [BaseVisitor['visitInstance']]
     */
    visitInstance(node) {
        if (!node) return null;
        const struct = this.Environment.get(node.id, node.location);

        if (!(struct instanceof Struct)) {
            throw new LocationError('Expected struct in instance creation', node.location);
        }
        
        return new Literal({type: node.id, value: struct.invoke(this, node.args)});
    }

    /**
     * @type [BaseVisitor['visitGet']]
     */
    visitGet(node) {
        if (!node) return null;
        const instance = node.object.accept(this);

        if (!(instance instanceof Literal)) {
            throw new LocationError('Expected literal in get operation', node.location);
        }

        if (!(instance.value instanceof AbstractInstance)) {
            throw new LocationError('Expected struct in get operation', node.location);
        }

        if (node.property instanceof Callee) {
            node.property.args.unshift(instance)
            return node.property.accept(this);
        }

        if (node.property instanceof VarValue) {
            return instance.value.get(node.property.accept(this), node.location);
        }
        
        return instance.value.get(node.property, node.location);
    }

    /**
     * @type [BaseVisitor['visitSet']]
     */
    visitSet(node) {
        if (!node) return null;
        const instance = node.object.accept(this);

        if (!(instance instanceof Literal)) {
            throw new LocationError('Expected literal in set operation', node.location);
        }

        if (!(instance.value instanceof AbstractInstance) && !(instance.value instanceof Array)) {
            throw new LocationError('Expected struct in set operation', node.location);
        }

        const value = node.value.accept(this);

        const operations = {
            '=': () => value,
            '+=': () => ArithmeticOperation('+', instance.value.get(node.property), value, node.location),
            '-=': () => ArithmeticOperation('-', instance.value.get(node.property), value, node.location)
        };

        if (!(node.sig in operations)) {
            throw new LocationError(`Unsupported operation: ${node.sig}`, node.location);
        }

        const finalValue = operations[node.sig]();
        
        instance.value.set(node.property, finalValue, node.location);
        return finalValue;
    }

    /**
     * @type [BaseVisitor['visitSet']]
     */
    visitArrayInstance(node) {
        if(!node) return null;
        
        const arrayList = new ArrayList(node, []);
        
        const value = arrayList.invoke(this, node.args);
        
        return new Literal({type:node.type, value,});
    }


}