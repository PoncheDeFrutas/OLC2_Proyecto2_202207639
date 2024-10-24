
/**

 * @typedef {import('./nodes').Expression} Expression


 * @typedef {import('./nodes').Literal} Literal


 * @typedef {import('./nodes').Group} Group


 * @typedef {import('./nodes').VarValue} VarValue


 * @typedef {import('./nodes').Unary} Unary


 * @typedef {import('./nodes').Arithmetic} Arithmetic


 * @typedef {import('./nodes').Relational} Relational


 * @typedef {import('./nodes').Logical} Logical


 * @typedef {import('./nodes').Ternary} Ternary


 * @typedef {import('./nodes').VarAssign} VarAssign


 * @typedef {import('./nodes').Return} Return


 * @typedef {import('./nodes').Continue} Continue


 * @typedef {import('./nodes').Break} Break


 * @typedef {import('./nodes').Case} Case


 * @typedef {import('./nodes').Switch} Switch


 * @typedef {import('./nodes').For} For


 * @typedef {import('./nodes').ForEach} ForEach


 * @typedef {import('./nodes').While} While


 * @typedef {import('./nodes').If} If


 * @typedef {import('./nodes').Block} Block


 * @typedef {import('./nodes').Print} Print


 * @typedef {import('./nodes').ExpressionStatement} ExpressionStatement


 * @typedef {import('./nodes').VarDeclaration} VarDeclaration


 * @typedef {import('./nodes').Callee} Callee


 * @typedef {import('./nodes').FuncDeclaration} FuncDeclaration


 * @typedef {import('./nodes').StructDeclaration} StructDeclaration


 * @typedef {import('./nodes').Instance} Instance


 * @typedef {import('./nodes').Get} Get


 * @typedef {import('./nodes').Set} Set


 * @typedef {import('./nodes').ArrayInstance} ArrayInstance

 */


/**
 * Base visitor class.
 * @abstract
 */
export class BaseVisitor {

    
    /**
     * @param {Expression} node
     * @returns {any}
     */
    visitExpression(node) {
        throw new Error('Method visitExpression not implemented');
    }
    

    /**
     * @param {Literal} node
     * @returns {any}
     */
    visitLiteral(node) {
        throw new Error('Method visitLiteral not implemented');
    }
    

    /**
     * @param {Group} node
     * @returns {any}
     */
    visitGroup(node) {
        throw new Error('Method visitGroup not implemented');
    }
    

    /**
     * @param {VarValue} node
     * @returns {any}
     */
    visitVarValue(node) {
        throw new Error('Method visitVarValue not implemented');
    }
    

    /**
     * @param {Unary} node
     * @returns {any}
     */
    visitUnary(node) {
        throw new Error('Method visitUnary not implemented');
    }
    

    /**
     * @param {Arithmetic} node
     * @returns {any}
     */
    visitArithmetic(node) {
        throw new Error('Method visitArithmetic not implemented');
    }
    

    /**
     * @param {Relational} node
     * @returns {any}
     */
    visitRelational(node) {
        throw new Error('Method visitRelational not implemented');
    }
    

    /**
     * @param {Logical} node
     * @returns {any}
     */
    visitLogical(node) {
        throw new Error('Method visitLogical not implemented');
    }
    

    /**
     * @param {Ternary} node
     * @returns {any}
     */
    visitTernary(node) {
        throw new Error('Method visitTernary not implemented');
    }
    

    /**
     * @param {VarAssign} node
     * @returns {any}
     */
    visitVarAssign(node) {
        throw new Error('Method visitVarAssign not implemented');
    }
    

    /**
     * @param {Return} node
     * @returns {any}
     */
    visitReturn(node) {
        throw new Error('Method visitReturn not implemented');
    }
    

    /**
     * @param {Continue} node
     * @returns {any}
     */
    visitContinue(node) {
        throw new Error('Method visitContinue not implemented');
    }
    

    /**
     * @param {Break} node
     * @returns {any}
     */
    visitBreak(node) {
        throw new Error('Method visitBreak not implemented');
    }
    

    /**
     * @param {Case} node
     * @returns {any}
     */
    visitCase(node) {
        throw new Error('Method visitCase not implemented');
    }
    

    /**
     * @param {Switch} node
     * @returns {any}
     */
    visitSwitch(node) {
        throw new Error('Method visitSwitch not implemented');
    }
    

    /**
     * @param {For} node
     * @returns {any}
     */
    visitFor(node) {
        throw new Error('Method visitFor not implemented');
    }
    

    /**
     * @param {ForEach} node
     * @returns {any}
     */
    visitForEach(node) {
        throw new Error('Method visitForEach not implemented');
    }
    

    /**
     * @param {While} node
     * @returns {any}
     */
    visitWhile(node) {
        throw new Error('Method visitWhile not implemented');
    }
    

    /**
     * @param {If} node
     * @returns {any}
     */
    visitIf(node) {
        throw new Error('Method visitIf not implemented');
    }
    

    /**
     * @param {Block} node
     * @returns {any}
     */
    visitBlock(node) {
        throw new Error('Method visitBlock not implemented');
    }
    

    /**
     * @param {Print} node
     * @returns {any}
     */
    visitPrint(node) {
        throw new Error('Method visitPrint not implemented');
    }
    

    /**
     * @param {ExpressionStatement} node
     * @returns {any}
     */
    visitExpressionStatement(node) {
        throw new Error('Method visitExpressionStatement not implemented');
    }
    

    /**
     * @param {VarDeclaration} node
     * @returns {any}
     */
    visitVarDeclaration(node) {
        throw new Error('Method visitVarDeclaration not implemented');
    }
    

    /**
     * @param {Callee} node
     * @returns {any}
     */
    visitCallee(node) {
        throw new Error('Method visitCallee not implemented');
    }
    

    /**
     * @param {FuncDeclaration} node
     * @returns {any}
     */
    visitFuncDeclaration(node) {
        throw new Error('Method visitFuncDeclaration not implemented');
    }
    

    /**
     * @param {StructDeclaration} node
     * @returns {any}
     */
    visitStructDeclaration(node) {
        throw new Error('Method visitStructDeclaration not implemented');
    }
    

    /**
     * @param {Instance} node
     * @returns {any}
     */
    visitInstance(node) {
        throw new Error('Method visitInstance not implemented');
    }
    

    /**
     * @param {Get} node
     * @returns {any}
     */
    visitGet(node) {
        throw new Error('Method visitGet not implemented');
    }
    

    /**
     * @param {Set} node
     * @returns {any}
     */
    visitSet(node) {
        throw new Error('Method visitSet not implemented');
    }
    

    /**
     * @param {ArrayInstance} node
     * @returns {any}
     */
    visitArrayInstance(node) {
        throw new Error('Method visitArrayInstance not implemented');
    }
    
}
