import {BaseVisitor} from "./visitor.js";
import {Generator} from "../compiler/risc/generator.js";
import {registers as r} from "../compiler/risc/constants.js";
import nodes from "./nodes.js";
import {handlePopObject} from "../compiler/risc/utils.js";


export class CompilerVisitor extends BaseVisitor {

    constructor() {
        super();
        this.code = new Generator();
    }

    /**
     * @type [BaseVisitor['visitExpressionStatement']]
     */
    visitExpressionStatement(node) {
        node.exp.accept(this);
        handlePopObject(this.code, r.T0, r.FT0);
    }

    /**
     * @type [BaseVisitor['visitGroup']]
     */
    visitGroup(node) {
        node.exp.accept(this);
    }

    /**
     * @type [BaseVisitor['visitLiteral']]
     */
    visitLiteral(node) {
        this.code.comment(`Literal: ${node.value}`);
        this.code.pushConstant(node);
        this.code.comment(`Literal: ${node.value} end`);
    }

    /**
     * @type [BaseVisitor['visitPrint']]
     */
    visitPrint(node) {
        this.code.comment(`Print`);

        const print = {
            'int': () => this.code.printInt(),
            'bool': () => this.code.printInt(),
            'char': () => this.code.printChar(),
            'string': () => this.code.printString(),
            'float': () => this.code.printFloat(),
        }
        
        node.exp.forEach(exp => {
           exp.accept(this);
           const object = handlePopObject(this.code, r.A0, r.FA0);
           print[object.type]();
        });
        
        this.code.callBuiltin('jump');

        this.code.comment(`Print end`);
    }


    /**
     * @type [BaseVisitor['visitArithmetic']]
     */
    visitArithmetic(node) {
        this.code.comment(`Arithmetic ${node.op}`);

        node.left.accept(this);
        node.right.accept(this);

        const right = handlePopObject(this.code, r.T1, r.FT1);
        const left = handlePopObject(this.code, r.T0, r.FT0);

        if (left.type === 'string' && right.type === 'string') {
            this.code.callBuiltin('concatString');
            this.code.pushObject({type: 'string', length: 4});
            return null;
        }

        const isFloatOp = left.type === 'float' || right.type === 'float';

        if (isFloatOp) {
            if (right.type !== 'float') this.code.fcvtsw(r.FT1, r.T1);
            if (left.type !== 'float') this.code.fcvtsw(r.FT0, r.T0);
        }

        const performOperation = (opMap) => {
            if (opMap[node.op]) {
                opMap[node.op]();
            } else {
                throw new Error(`Unsupported operation: ${node.op}`);
            }
        };

        const floatOps = {
            '+': () => this.code.callBuiltin('addFloat'),
            '-': () => this.code.callBuiltin('subFloat'),
            '*': () => this.code.callBuiltin('mulFloat'),
            '/': () => this.code.callBuiltin('divFloat'),
            '%': () => this.code.callBuiltin('remFloat'),
        };

        const intOps = {
            '+': () => this.code.callBuiltin('addInt'),
            '-': () => this.code.callBuiltin('subInt'),
            '*': () => this.code.callBuiltin('mulInt'),
            '/': () => this.code.callBuiltin('divInt'),
            '%': () => this.code.callBuiltin('remInt'),
        };

        performOperation(isFloatOp ? floatOps : intOps);

        this.code.pushObject({type: isFloatOp ? 'float' : left.type, length: 4});
    }


    /**
     * @type [BaseVisitor['visitRelational']]
     */
    visitRelational(node) {
        this.code.comment(`Relational ${node.op}`);

        node.left.accept(this);
        node.right.accept(this);

        const right = handlePopObject(this.code, r.T1, r.FT1);
        const left = handlePopObject(this.code, r.T0, r.FT0);

        if (left.type === 'string' && right.type === 'string') {
            this.code.callBuiltin('compareString');

            const stringOps = {
                '==': () => this.code.sltu(r.T0, r.ZERO, r.T0),
                '!=': () => this.code.sltiu(r.T0, r.T0, 1),
            };

            stringOps[node.op]();
        } else {
            const isFloatOp = left.type === 'float' || right.type === 'float';

            if (isFloatOp) {
                if (!right.type) this.code.fcvtsw(r.FT1, r.T1);
                if (!left.type) this.code.fcvtsw(r.FT0, r.T0);
            }

            const performRelationalOperation = (opMap) => {
                if (opMap[node.op]) {
                    opMap[node.op]();
                } else {
                    throw new Error(`Unsupported relational operation: ${node.op}`);
                }
            };

            const floatOps = {
                '<': () => this.code.callBuiltin('lessThanFloat'),
                '>': () => this.code.callBuiltin('greaterThanFloat'),
                '<=': () => this.code.callBuiltin('lessEqualFloat'),
                '>=': () => this.code.callBuiltin('greaterEqualFloat'),
                '==': () => this.code.callBuiltin('equalFloat'),
                '!=': () => this.code.callBuiltin('notEqualFloat'),
            };

            const intOps = {
                '<': () => this.code.callBuiltin('lessThanInt'),
                '>': () => this.code.callBuiltin('greaterThanInt'),
                '<=': () => this.code.callBuiltin('lessEqualInt'),
                '>=': () => this.code.callBuiltin('greaterEqualInt'),
                '==': () => this.code.callBuiltin('equalInt'),
                '!=': () => this.code.callBuiltin('notEqualInt'),
            };

            performRelationalOperation(isFloatOp ? floatOps : intOps);
        }

        this.code.pushObject({ type: 'bool', length: 4 });
        this.code.comment(`Relational ${node.op} end`);
    }

    /**
     * @type [BaseVisitor['visitLogical']]
     */
    visitLogical(node) {
        this.code.comment(`Logical ${node.op}`);

        node.left.accept(this);
        node.right.accept(this);

        this.code.popObject(r.T0);
        this.code.popObject(r.T1);
        
        const ops = {
            '&&': () => this.code.callBuiltin('andInt'),
            '||': () => this.code.callBuiltin('orInt'),
        };

        ops[node.op]();
        
        this.code.pushObject({type: 'bool', length: 4});

        this.code.comment(`Logical ${node.op} end`);
    }

    /**
     * @type [BaseVisitor['visitUnary']]
     */
    visitUnary(node) {
        this.code.comment(`Unary ${node.op}`);
        
        node.exp.accept(this);
        const object = handlePopObject(this.code, r.T0, r.FT0);
        
        const ops = {
            '-': () => this.code.callBuiltin('negInt'),
            '!': () => this.code.callBuiltin('negBool'),
        };
        
        if (object.type === 'float') {
            this.code.callBuiltin('negFloat');
        } else {
            ops[node.op]();
        }
        
        this.code.pushObject(object);
        this.code.comment(`Unary ${node.op} end`);
    }

    /**
     * @type [BaseVisitor['visitVarDeclaration']]
     */
    visitVarDeclaration(node) {
        this.code.comment(`Variable declaration ${node.id}`);
        
        if (node.value) {
            node.value.accept(this);
        } else {
            const Literal = new nodes.Literal({type:node.type, value: 0})
            Literal.accept(this);
        }
        this.code.tagObject(node.id);
        
        this.code.comment(`Variable declaration ${node.id} end`);
    }

    /**
     * @type [BaseVisitor['visitVarAssign']]
     */
    visitVarAssign(node) {
        this.code.comment(`Variable assign ${node.id}`);

        node.assign.accept(this);
        const value = handlePopObject(this.code, r.T0, r.FT0);
        const [offset, object] = this.code.getObject(node.id);

        this.code.addi(r.T1, r.SP, offset);

        if(object.type !== 'float' ) {
            this.code.sw(r.T0, r.T1)
            this.code.push();
        } else {
            if (value.type !== 'float') {
                this.code.fcvtsw(r.FT0, r.T0);
            }
            this.code.fsw(r.FT0, r.T1);
            this.code.pushFloat();
        }
        
        this.code.pushObject(object);

        this.code.comment(`Variable assign ${node.id} end`);
    }

    /**
     * @type [BaseVisitor['visitVarValue']]
     */
    visitVarValue(node) {
        this.code.comment(`Variable value ${node.id}`);
        
        const [offset, object] = this.code.getObject(node.id);
        this.code.addi(r.T0, r.SP, offset);
        if (object.type !== 'float') {
            this.code.lw(r.T1, r.T0);
            this.code.push(r.T1);
        } else {
            this.code.flw(r.FT0, r.T0);
            this.code.pushFloat();
        }
        
        this.code.pushObject({...object, id:undefined});

        this.code.comment(`Variable value ${node.id} end`);
    }

    /**
     * @type [BaseVisitor['visitBlock']]
     */
    visitBlock(node) {
        this.code.comment(`Block`);
        
        this.code.newScope();
        
        node.stmt.forEach(stmt => {
            if (stmt) stmt.accept(this);
        });
        
        this.code.comment(`Stack reduce`);
        
        this.code.addi(r.SP, r.SP, this.code.endScope());
        
        this.code.comment(`Block end`);
    }

    /**
     * @type [BaseVisitor['visitBlock']]
     */
    visitIf(node) {
        this.code.comment(`If statement`);

        node.cond.accept(this);
        this.code.popObject();

        const endLabel = this.code.getLabel();
        const elseLabel = node.stmtElse ? this.code.getLabel() : null;

        if (elseLabel) {
            this.code.beq(r.T0, r.ZERO, elseLabel);
        } else {
            this.code.beq(r.T0, r.ZERO, endLabel);
        }

        node.stmtThen.accept(this);

        if (elseLabel) {
            this.code.j(endLabel);
            this.code.addLabel(elseLabel);
            node.stmtElse.accept(this);
        }

        this.code.addLabel(endLabel);

        this.code.comment(`If statement end`);
    }

    /**
     * @type [BaseVisitor['visitTernary']]
     */
    visitTernary(node) {
        this.code.comment(`Ternary`);
        
        node.cond.accept(this);
        this.code.popObject();
        
        const falseLabel = this.code.getLabel();
        const endLabel = this.code.getLabel();
        
        this.code.beq(r.T0, r.ZERO, falseLabel);
        
        node.trueExp.accept(this);
        this.code.j(endLabel);
        
        this.code.addLabel(falseLabel);
        node.falseExp.accept(this);
        
        this.code.addLabel(endLabel);
        
        this.code.comment(`Ternary end`);
    }

    visitLoop(cond, body, update = null) {
        const loopLabel = this.code.getLabel();
        const endLabel = this.code.getLabel();
        const continueLabel = this.code.getLabel();

        this.code.pushBreakLabel(endLabel);
        this.code.pushContinueLabel(continueLabel);
        
        this.code.addLabel(loopLabel);

        cond.accept(this);
        this.code.popObject();
        
        this.code.beq(r.T0, r.ZERO, endLabel);
        
        body.accept(this);
        
        this.code.addLabel(continueLabel);
        
        if (update) {
            update.accept(this);
            this.code.popObject();
        }
        
        this.code.j(loopLabel);
        this.code.addLabel(endLabel);
        
        this.code.popBreakLabel();
        this.code.popContinueLabel();
    }

    /**
     * @type [BaseVisitor['visitWhile']]
     */
    visitWhile(node) {
        this.code.comment(`While statement`);
        this.visitLoop(node.cond, node.stmt);
        this.code.comment(`While statement end`);
    }

    /**
     * @type [BaseVisitor['visitFor']]
     */
    visitFor(node) {
        this.code.comment(`For statement`);
        this.code.newScope();
        node.init.accept(this);
        this.visitLoop(node.cond, node.stmt, node.update);
        this.code.addi(r.SP, r.SP, this.code.endScope());
        this.code.comment(`For statement end`);
    }

    /**
     * @type [BaseVisitor['visitBreak']]
     */
    visitBreak(node) {
        this.code.comment(`Break`);
        const breakLabel = this.code.breakLabel[this.code.breakLabel.length - 1];
        this.code.j(breakLabel);
        this.code.comment(`Break end`);
    }

    /**
     * @type [BaseVisitor['visitContinue']]
     */
    visitContinue(node) {
        this.code.comment(`Continue`);
        const continueLabel = this.code.continueLabel[this.code.continueLabel.length - 1];
        this.code.j(continueLabel);
        this.code.comment(`Continue end`);
    }

    /**
     * @type [BaseVisitor['visitCase']]
     */
    visitCase(node) {
        this.code.comment(`Case statement`)
        node.stmt.forEach(stmt => stmt.accept(this));
        this.code.comment(`Case statement end`)
    }

    /**
     * @type [BaseVisitor['visitSwitch']]
     */
    visitSwitch(node) {
        this.code.comment(`Switch statement`);
        
        const caseLabels = node.cases.map(() => this.code.getLabel());
        const defaultLabel = node.def ? this.code.getLabel() : null;
        const endLabel = this.code.getLabel();

        this.code.pushBreakLabel(endLabel);

        node.cases.forEach((Case, i) => {
            const condition = new nodes.Relational({op: "==", left: node.cond, right: Case.cond});
            condition.accept(this);
            this.code.popObject();
            this.code.bne(r.T0, r.ZERO, caseLabels[i]);
        });

        if (defaultLabel) {
            this.code.j(defaultLabel);
        } else {
            this.code.j(endLabel);
        }

        node.cases.forEach((Case, index) => {
            this.code.addLabel(caseLabels[index]);
            Case.accept(this);
        });

        if (defaultLabel) {
            this.code.addLabel(defaultLabel);
            node.def.accept(this);
        }

        this.code.addLabel(endLabel);
        this.code.popBreakLabel();

        this.code.comment(`Switch statement end`);
    }

    /**
     * @type [BaseVisitor['visitArrayInstance']]
     */
    visitArrayInstance(node) {
        this.code.comment(`Array instance`);
        let dim;
        if (node.type && node.dim) {
            dim = node.dim[0].value
            for (let i = 0; i < node.dim[0].value; i++) {
                const Literal = new nodes.Literal({type:node.type, value: 0})
                Literal.accept(this);
            }
        } else {
            node.args.reverse().forEach(arg => {
                arg.accept(this);
            });
            dim = node.args.length;
        }
        this.code.mv(r.T2, r.HP);

        for (let i = 0; i < dim; i++) {
            this.code.objectStack.pop();
            this.code.pop();
            this.code.callBuiltin('instance');
        }

        this.code.push(r.T2);
        this.code.pushObject({type: 'vec' + (node.type || node.args[0].type), length: 4 });
        this.code.comment(`Array instance end`);
    }

    /**
     * @type [BaseVisitor['visitGet']]
     */
    visitGet(node) {
        this.code.comment(`Get`);

        node.object.accept(this);
        node.property.accept(this);

        this.code.popObject(r.T1);
        const object = this.code.popObject();

        this.code.callBuiltin('getElement');

        this.code.pushObject({type: object.type.slice(3), length:4 })

        this.code.comment(`Get end`);
    }

    /**
     * @type [BaseVisitor['visitGet']]
     */
    visitSet(node) {
        this.code.comment(`Get`);

        node.object.accept(this);
        node.property.accept(this);
        node.value.accept(this);

        const result = this.code.popObject(r.T2);
        this.code.popObject(r.T1);
        this.code.popObject();

        this.code.callBuiltin('setElement');

        this.code.pushObject(result);
        this.code.comment(`Get end`);
    }
}