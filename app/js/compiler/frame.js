import { BaseVisitor } from "../ast/visitor.js";
import nodes from "../ast/nodes.js";

export class FrameVisitor extends BaseVisitor {

    constructor (baseOffset) {
        super();
        this.frame = [];
        this.localSize = 0;
        this.baseOffset = baseOffset;
    }

    /**
     * @type [BaseVisitor['visitExpression']]
     */
    visitExpression(node) {
    }

    /**
     * @type [BaseVisitor['visitLiteral']]
     */
    visitLiteral(node) {
    }

    /**
     * @type [BaseVisitor['visitGroup']]
     */
    visitGroup(node) {
    }

    /**
     * @type [BaseVisitor['visitArithmetic']]
     */
    visitArithmetic(node) {
    }

    /**
     * @type [BaseVisitor['visitRelational']]
     */
    visitRelational(node) {
    }

    /**
     * @type [BaseVisitor['visitLogical']]
     */
    visitLogical(node) {
    }

    /**
     * @type [BaseVisitor['visitUnary']]
     */
    visitUnary(node) {
    }

    /**
     * @type [BaseVisitor['visitVarValue']]
     */
    visitVarValue(node) {

    }

    /**
     * @type [BaseVisitor['visitPrint']]
     */
    visitPrint(node) {
    }

    /**
     * @type [BaseVisitor['visitExpressionStatement']]
     */
    visitExpressionStatement(node) {
    }

    /**
     * @type [BaseVisitor['visitTernary']]
     */
    visitTernary(node) {
    }

    /**
     * @type [BaseVisitor['visitVarAssign']]
     */
    visitVarAssign(node) {
    }

    /**
     * @type [BaseVisitor['visitReturn']]
     */
    visitReturn(node) {
    }

    /**
     * @type [BaseVisitor['visitContinue']]
     */
    visitContinue(node) {
    }

    /**
     * @type [BaseVisitor['visitBreak']]
     */
    visitBreak(node) {
    }

    /**
     * @type [BaseVisitor['visitCallee']]
     */
    visitCallee(node) {
    }

    /**
     * @type [BaseVisitor['visitFuncDeclaration']]
     */
    visitFuncDeclaration(node) {
    }

    /**
     * @type [BaseVisitor['visitStructDeclaration']]
     */
    visitStructDeclaration(node) {
    }

    /**
     * @type [BaseVisitor['visitInstance']]
     */
    visitInstance(node) {
    }

    /**
     * @type [BaseVisitor['visitGet']]
     */
    visitGet(node) {
    }

    /**
     * @type [BaseVisitor['visitSet']]
     */
    visitSet(node) {
    }

    /**
     * @type [BaseVisitor['visitArrayInstance']]
     */
    visitArrayInstance(node) {
    }

    /**
     * @type [BaseVisitor['visitCase']]
     */
    visitCase(node) {
        const block = new nodes.Block({stmt:node.stmt});
        block.accept(this);
    }

    /**
     * @type [BaseVisitor['visitSwitch']]
     */
    visitSwitch(node) {
        node.cases.forEach(c => c.accept(this));
        node.def.accept(this);
    }

    /**
     * @type [BaseVisitor['visitFor']]
     */
    visitFor(node) {
        node.stmt.accept(this);
    }

    /**
     * @type [BaseVisitor['visitForEach']]
     */
    visitForEach(node) {
        node.stmt.accept(this);
    }

    /**
     * @type [BaseVisitor['visitWhile']]
     */
    visitWhile(node) {
        node.stmt.accept(this);
    }

    /**
     * @type [BaseVisitor['visitIf']]
     */
    visitIf(node) {
        node.stmtThen.accept(this);
        if (node.stmtElse) node.stmtElse.accept(this);
    }

    /**
     * @type [BaseVisitor['visitBlock']]
     */
    visitBlock(node) {
        node.stmt.forEach(stmt => stmt.accept(this));
    }

    /**
     * @type [BaseVisitor['visitVarDeclaration']]
     */
    visitVarDeclaration(node) {
        this.frame.push({
            id: node.id,
            type: node.type,
            offset: this.baseOffset + this.localSize,
        });
        this.localSize++;
    }
}