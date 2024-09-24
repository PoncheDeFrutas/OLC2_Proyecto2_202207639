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
        this.code.popObject(r.T0);
    }

    /**
     * @type [BaseVisitor['visitBinaryExpression']]
     */
    visitLiteral(node) {
        this.code.comment('Literal: ' + node.value);
        this.code.pushConstant(node);
        this.code.comment('End Literal: ' + node.value);
    }

    /**
     * @type [BaseVisitor['visitArithmetic']]
     */
    visitArithmetic(node) {
        this.code.comment('Arithmetic: ' + node.op);
        node.left.accept(this);
        node.right.accept(this);

        this.code.popObject(r.T0);
        this.code.popObject(r.T1);

        switch (node.op) {
            case '+':
                this.code.add(r.T0, r.T0, r.T1);
                break;
            case '-':
                this.code.sub(r.T0, r.T1, r.T0);
                break;
            case '*':
                this.code.mul(r.T0, r.T0, r.T1);
                break;
            case '/':
                this.code.div(r.T0, r.T1, r.T0);
                break;
            case '%':
                this.code.rem(r.T0, r.T1, r.T0);
                break;
        }

        this.code.push();
        this.code.pushObject({type: 'int', length: 4});
        this.code.comment('End Arithmetic: ' + node.op);
    }

    /**
     * @type [BaseVisitor['visitUnary']]
     */
    visitUnary(node) {
        this.code.comment('Unary: ' + node.op);
        node.exp.accept(this);

        this.code.popObject();

        switch (node.op) {
            case '-':
                this.code.li(r.T1, 0);
                this.code.sub(r.T0, r.T1, r.T0);
                this.code.push(r.T0)
                this.code.pushObject({type: 'int', length: 4});
                break;
        }
        this.code.comment('End Unary: ' + node.op);
    }

    /**
     * @type [BaseVisitor['visitGroup']]
     */
    visitGroup(node) {
        return node.exp.accept(this);
    }

    /**
     * @type [BaseVisitor['visitPrint']]
     */
    visitPrint(node) {
        this.code.comment('Print');
        node.exp[0].accept(this);
        const object = this.code.popObject(r.A0);

        const type = {
            'int': () => this.code.printInt(),
            'string': () => this.code.printString()
        }

        type[object.type]();
        this.code.comment('End Print');
    }

    /**
     * @type [BaseVisitor['visitVarDeclaration']]
     */
    visitVarDeclaration(node) {
        this.code.comment('Var Declaration: ' + node.id);
        node.value.accept(this);
        this.code.tagObject(node.id);
        this.code.comment('End Var Declaration: ' + node.id);
    }

    /**
     * @type [BaseVisitor['visitVarAssign']]
     */
    visitVarAssign(node) {
        this.code.comment('Var Assign: ' + node.id);

        node.assign.accept(this);
        const object = this.code.popObject(r.T0);
        const [offset, tag] = this.code.getObject(node.id);

        this.code.addi(r.T1, r.SP, offset)
        this.code.sw(r.T0, r.T1);

        tag.type = object.type;
        this.code.push(r.T0);
        this.code.pushObject(object);

        this.code.comment('End Var Assign: ' + node.id);
    }

    /**
     * @type [BaseVisitor['visitVarValue']]
     */
    visitVarValue(node) {
        this.code.comment('Var Value: ' + node.id);
        const [offset, tag] = this.code.getObject(node.id);
        this.code.addi(r.T0, r.SP, offset);
        this.code.lw(r.T0, r.T0);
        this.code.push(r.T0);
        this.code.pushObject({ ... tag, id:undefined});
        this.code.comment('End Var Value: ' + node.id);
    }

    /**
     * @type [BaseVisitor['visitBlock']]
     */
    visitBlock(node) {
        this.code.comment('Block');
        this.code.newScope();
        node.stmt.forEach((statement) => statement.accept(this));
        
        this.code.comment('Reduce Stack')
        const remove = this.code.endScope();
        if (remove > 0) {
            this.code.addi(r.SP, r.SP, remove);
        }
        
        this.code.comment('End Block');
    }
}