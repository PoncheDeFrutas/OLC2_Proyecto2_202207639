import {BaseVisitor} from "./visitor.js";
import {Generator} from "../compiler/risc/generator.js";
import {registers as r} from "../compiler/risc/constants.js";

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
        this.code.popObject();
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
        }
        
        node.exp.forEach(exp => {
           exp.accept(this);
           const object = this.code.popObject(r.A0);
           print[object.type]();
           
        });
        this.code.li(r.A0, 10);
        this.code.li(r.A7, 11);
        this.code.ecall();

        this.code.comment(`Print end`);
    }


    /**
     * @type [BaseVisitor['visitArithmetic']]
     */
    visitArithmetic(node) {
        this.code.comment(`Arithmetic ${node.op}`);
        
        node.left.accept(this);
        node.right.accept(this);

        const right = this.code.popObject(r.T0);
        const left = this.code.popObject(r.T1);

        if (left.type === 'string' && right.type === 'string') {
            this.code.add(r.A0, r.ZERO, r.T1);
            this.code.add(r.A1, r.ZERO, r.T0);
            this.code.callBuiltin('concatString');
            this.code.pushObject({type: 'string', length: 4});
            return null;
        }

        const ops = {
            '+': () => this.code.add(r.T0, r.T1, r.T0),
            '-': () => this.code.sub(r.T0, r.T1, r.T0),
            '*': () => this.code.mul(r.T0, r.T1, r.T0),
            '/': () => this.code.div(r.T0, r.T1, r.T0),
            '%': () => this.code.rem(r.T0, r.T1, r.T0),
        };
        
        ops[node.op]();
        this.code.push();
        this.code.pushObject({type: left.type, length: 4});
    }

    /**
     * @type [BaseVisitor['visitRelational']]
     */
    visitRelational(node) {
        this.code.comment(`Relational ${node.op}`);

        const labels = {
            aux: this.code.getLabel(),
            end: this.code.getLabel(),
        };

        node.left.accept(this);
        node.right.accept(this);

        const right = this.code.popObject(r.T0);
        const left = this.code.popObject(r.T1);

        if (left.type === 'string' && right.type === 'string') {
            this.code.add(r.A0, r.ZERO, r.T1);
            this.code.add(r.A1, r.ZERO, r.T0);
            this.code.callBuiltin('compareString');

            const stringOps = {
                '==': () => this.code.beq(r.T0, r.ZERO, labels.aux),
                '!=': () => this.code.bne(r.T0, r.ZERO, labels.aux),
            };

            stringOps[node.op]();
        } else {
            const ops = {
                '<': () => this.code.blt(r.T1, r.T0, labels.aux),
                '>': () => this.code.blt(r.T0, r.T1, labels.aux),
                '<=': () => this.code.bge(r.T0, r.T1, labels.aux),
                '>=': () => this.code.bge(r.T1, r.T0, labels.aux),
                '==': () => this.code.beq(r.T0, r.T1, labels.aux),
                '!=': () => this.code.bne(r.T0, r.T1, labels.aux),
            };

            ops[node.op]();
        }

        this.code.li(r.T0, 0);
        this.code.push();
        this.code.j(labels.end);

        this.code.addLabel(labels.aux);
        this.code.li(r.T0, 1);
        this.code.push();

        this.code.addLabel(labels.end);
        this.code.pushObject({ type: 'bool', length: 4 });

        this.code.comment(`Relational ${node.op} end`);
    }


    /**
     * @type [BaseVisitor['visitLogical']]
     */
    visitLogical(node) {
        this.code.comment(`Logical ${node.op}`);

        const labels = {
            aux: this.code.getLabel(),
            end: this.code.getLabel(),
        };

        node.left.accept(this);
        this.code.popObject();

        const isAnd = node.op === '&&';
        const branch = isAnd ? this.code.beq : this.code.bne;

        branch.call(this.code, r.T0, r.ZERO, labels.aux);

        node.right.accept(this);
        this.code.popObject();

        branch.call(this.code, r.T0, r.ZERO, labels.aux);

        this.code.li(r.T0, isAnd ? 1 : 0);
        this.code.push();
        this.code.j(labels.end);

        this.code.addLabel(labels.aux);
        this.code.li(r.T0, isAnd ? 0 : 1);
        this.code.push();

        this.code.addLabel(labels.end);
        this.code.pushObject({type: 'bool', length: 4});

        this.code.comment(`Logical ${node.op} end`);
    }

    /**
     * @type [BaseVisitor['visitUnary']]
     */
    visitUnary(node) {
        this.code.comment(`Unary ${node.op}`);
        
        node.exp.accept(this);
        this.code.popObject();
        
        const ops = {
            '-': () => this.code.sub(r.T0, r.ZERO, r.T0),
            '!': () => this.code.xori(r.T0, r.T0, 1),
        };
        
        ops[node.op]();
        this.code.push();
        
        const resultType = (node.op === '-') ? 'int' : 'bool';
        this.code.pushObject({type: resultType, length: 4});
        this.code.comment(`Unary ${node.op} end`);
        
    }

    /**
     * @type [BaseVisitor['visitVarDeclaration']]
     */
    visitVarDeclaration(node) {
        this.code.comment(`Variable declaration ${node.id}`);
        
        node.value.accept(this);
        this.code.tagObject(node.id);
        
        this.code.comment(`Variable declaration ${node.id} end`);
    }

    /**
     * @type [BaseVisitor['visitVarAssign']]
     */
    visitVarAssign(node) {
        this.code.comment(`Variable assign ${node.id}`);

        node.assign.accept(this);
        const value = this.code.popObject();
        const [offset, object] = this.code.getObject(node.id);

        this.code.addi(r.T1, r.SP, offset);

        this.code.sw(r.T0, r.T1);
        
        object.type = value.type;

        this.code.push();
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
        this.code.lw(r.T1, r.T0);
        this.code.push(r.T1);
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
        node.init.accept(this);
        this.visitLoop(node.cond, node.stmt, node.update);
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

        node.cond.accept(this);
        this.code.popObject(r.T1);

        const caseLabels = node.cases.map(() => this.code.getLabel());
        const defaultLabel = node.def ? this.code.getLabel() : null;
        const endLabel = this.code.getLabel();

        this.code.pushBreakLabel(endLabel);

        node.cases.forEach((Case, i) => {
            Case.cond.accept(this);
            this.code.popObject(r.T0);

            this.code.beq(r.T1, r.T0, caseLabels[i]);
        });

        if (defaultLabel) {
            this.code.j(defaultLabel);
        } else {
            this.code.j(endLabel);
        }

        node.cases.forEach((Case, index) => {
            this.code.addLabel(caseLabels[index]);
            this.visitCase(Case);
        });

        if (defaultLabel) {
            this.code.addLabel(defaultLabel);
            node.def.accept(this);
        }

        this.code.addLabel(endLabel);
        this.code.popBreakLabel();

        this.code.comment(`Switch statement end`);
    }
    
}