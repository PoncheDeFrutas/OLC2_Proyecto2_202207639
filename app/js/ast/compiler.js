import {BaseVisitor} from "./visitor.js";
import {Generator} from "../compiler/risc/generator.js";
import {registers as r} from "../compiler/risc/constants.js";
import nodes from "./nodes.js";
import {handlePopObject} from "../compiler/risc/utils.js";
import {builtin} from "../compiler/risc/builtins.js";
import {FrameVisitor} from "../compiler/frame.js";


export class CompilerVisitor extends BaseVisitor {

    constructor() {
        super();
        this.code = new Generator();
        
        this.functionMetadata = {};
        this.insideFunction = false;
        this.frameDclIndex = 0;
        this.returnLabel = null;
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
            'int': () => this.code.callBuiltin('printInt'),
            'bool': () => this.code.callBuiltin('printBool'),
            'char': () => this.code.callBuiltin('printChar'),
            'string': () => this.code.callBuiltin('printString'),
            'float': () => this.code.callBuiltin('printFloat'),
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
            this.code.push(r.T0);
        } else {
            const isFloatOp = left.type === 'float' || right.type === 'float';

            if (isFloatOp) {
                if (right.type !== 'float') this.code.fcvtsw(r.FT1, r.T1);
                if (left.type !== 'float') this.code.fcvtsw(r.FT0, r.T0);
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
            if (this.code.getTopObject().type.endsWith("[]") && node.value instanceof nodes.VarValue) {
                const object = this.code.popObject();
                this.code.li(r.T1, object.dim*4)
                this.code.callBuiltin('copyVector');
                this.code.pushObject(object);
            }
        } else {
            
            
            
            const Literal = new nodes.Literal({type:node.type, value: 123456789})
            Literal.accept(this);
        }

        if (this.insideFunction) {
            const localObject = this.code.getFrameLocal(this.frameDclIndex);
            const valueObj = this.code.popObject(r.T0);
            
            this.code.addi(r.T1, r.FP, -localObject.offset * 4);
            this.code.sw(r.T0, r.T1);
            
            localObject.type = valueObj.type;
            this.frameDclIndex++;
            return null;
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

        if (this.insideFunction) {
            this.code.addi(r.T1, r.FP, -object.offset *4);
            this.code.sw(r.T0, r.T1);
            return null;
        }
        
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
        
        if (this.insideFunction) {
            this.code.addi(r.T1, r.FP, -object.offset * 4);
            this.code.lw(r.T0, r.T1);
            this.code.push(r.T0);
            this.code.pushObject({...object, id:undefined});
            return null;
        }
        
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
     * @type [BaseVisitor['visitForEach']]
     */
    visitForEach(node) {
        this.code.comment(`For each statement`);
        
        let literal = new nodes.Literal({type:'int', value:0});
        const init = new nodes.VarDeclaration({type:'int', id:'cba', value:literal});
        
        const varValue = new nodes.VarValue({id:'cba'});
        const callee = new nodes.Callee({callee:'length', args:[]});
        const getLength = new nodes.Get({object: node.array, property:callee});
        const relational = new nodes.Relational({op:'<', left:varValue, right:getLength});

        let literal2 = new nodes.Literal({type:'int', value:1});
        const Arithmetic = new nodes.Arithmetic({op:'+', left:varValue, right:literal2});
        const update = new nodes.VarAssign({id:'cba', sig:'=', assign:Arithmetic});
        
        const insideUpdate = new nodes.VarAssign({
            id:node.vd.id,
            sig:'=',
            assign:new nodes.Get({object:node.array, property:varValue})
        });

        node.stmt.stmt.unshift(insideUpdate);

        const baseFor = new nodes.For({init:init, cond:relational, update:update, stmt:node.stmt});
        
        this.code.newScope();
        node.vd.accept(this);
        this.visitFor(baseFor);
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
        const block = new nodes.Block({stmt:node.stmt});
        block.accept(this);
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
            const Literal = new nodes.Literal({type:node.type, value: 0});
            for (let i = 0; i < dim; i++) {
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
        this.code.pushObject({type: (node.type || node.args[0].type) + '[]', length: 4, dim: dim});
        this.code.comment(`Array instance end`);
    }

    /**
     * @type [BaseVisitor['visitGet']]
     */
    visitGet(node) {
        this.code.comment(`Get`);

        node.object.accept(this);
        if (node.property instanceof nodes.Callee) {
            if (node.property.args[0]) {
                node.property.args[0].accept(this);
                this.code.popObject(r.T1);
            }
            const object = this.code.popObject(r.T0);
            if (node.property.callee === 'indexOf') {
                this.code.li(r.T5,  object.dim);
                this.code.callBuiltin('indexOf');
                this.code.pushObject({type: 'int', length:4 })
            } else if (node.property.callee === 'length') {
                this.code.li(r.T0,  object.dim);
                this.code.push();
                this.code.pushObject({type: 'int', length:4 })
            } else if (node.property.callee === 'Join') {

            }
        } else {
            node.property.accept(this);
            this.code.popObject(r.T1);
            const object = this.code.popObject();

            this.code.callBuiltin('getElement');
            this.code.pushObject({type: object.type.slice(0, -2), length:4 })
        }
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

    /**
     * @type [BaseVisitor['visitFuncDeclaration']]
     */
    visitFuncDeclaration(node) {
        const baseSize = 2;
        
        const paramSize = node.params.length;
        
        const frameVisitor = new FrameVisitor(baseSize + paramSize);
        node.block.accept(frameVisitor);
        const localFrame = frameVisitor.frame;
        const localSize = localFrame.length;
        
        const returnSize = 1;
        
        const totalSize = baseSize + paramSize + localSize + returnSize;
        this.functionMetadata[node.id] = {
            frameSize: totalSize,
            returnType: node.type,
        };
        
        const instruccionesDeMain = this.code.instrucctions;
        const instruccionesDeDeclaracionDeFuncion = []
        this.code.instrucctions = instruccionesDeDeclaracionDeFuncion;
        
        node.params.forEach((param, i) => {
            this.code.pushObject({
                id: param.id,
                type: param.type,
                length: 4,
                offset: baseSize + i
            })
        });
        
        localFrame.forEach((local, i) => {
            this.code.pushObject({
                ...local,
                length:4,
                type: 'local'
            });
        });
        
        this.insideFunction = node.id;
        this.frameDclIndex = 0;
        this.returnLabel = this.code.getLabel();
        
        this.code.comment(`Function ${node.id}`);
        this.code.addLabel(node.id);
        
        node.block.accept(this);
        
        this.code.addLabel(this.returnLabel);
        
        this.code.add(r.T0, r.ZERO, r.FP);
        this.code.lw(r.RA, r.T0)
        this.code.jalr(r.ZERO, r.RA, 0);
        this.code.comment(`Function ${node.id} end`);
        
        for (let i = 0; i < paramSize + localSize; i++) {
            this.code.objectStack.pop();
        }
        
        this.code.instrucctions = instruccionesDeMain
        
        instruccionesDeDeclaracionDeFuncion.forEach(ins => {
            this.code.instrucionesDeFunciones.push(ins);
        })
        this.insideFunction = false;
    }

    /**
     * @type [BaseVisitor['visitCallee']]
     */
    visitCallee(node) {
        if (!(node.callee instanceof nodes.VarValue)) return null;
        
        let nameFunction = node.callee.id;

        if (builtin.hasOwnProperty(nameFunction)) {
            node.args[0].accept(this);
            const object = handlePopObject(this.code, r.T0, r.FT0);
            
            const types = {
                'parseInt': () => 'int',
                'parsefloat': () => 'float',
                'typeof': (type) => {
                    this.code.la(r.A1, type);
                    return 'string';
                },
                'toLowerCase': () => 'string',
                'toUpperCase': () => 'string',
                'toString': (type) => {
                    if (type === 'bool') {
                        nameFunction = 'boolToString';
                    } else if (type === 'int') {
                        nameFunction = 'intToString';
                    } else if (type === 'float') {
                        nameFunction = 'floatToString';
                    }
                    return 'string';
                },
            }
            
            const type =  types[nameFunction](object.type)
            this.code.callBuiltin(nameFunction);

            this.code.pushObject({type: type, length: 4});
            return null;
        }

        this.code.comment(`Callee ${nameFunction}`);
        
        const returnLabel = this.code.getLabel();
        
        this.code.addi(r.SP, r.SP, -4*2);
        
        node.args.forEach(arg => {
            arg.accept(this);
        });

        this.code.addi(r.SP, r.SP, 4*(node.args.length + 2));
        
        this.code.addi(r.T1, r.SP, -4);
        
        this.code.la(r.T0, returnLabel);
        this.code.push(r.T0);
        
        this.code.push(r.FP);
        this.code.addi(r.FP, r.T1, 0);

        
        const frameSize = this.functionMetadata[nameFunction].frameSize;
        this.code.addi(r.SP, r.SP, -(frameSize - 2) * 4);
        this.code.j(nameFunction);
        
        this.code.addLabel(returnLabel);
        const returnSize = frameSize -1;
        this.code.addi(r.T0, r.FP, -returnSize * 4);
        this.code.lw(r.A0, r.T0);
        
        this.code.addi(r.T0, r.FP, -4);
        this.code.lw(r.FP, r.T0);
        
        this.code.addi(r.SP, r.SP, (frameSize)*4);
        
        this.code.push(r.A0);
        this.code.pushObject({type: this.functionMetadata[nameFunction].returnType, length: 4});
        this.code.comment(`Callee ${nameFunction} end`);
    }

    /**
     * @type [BaseVisitor['visitReturn']]
     */
    visitReturn(node) {
        this.code.comment(`Return`);
        
        if (node.exp) {
            node.exp.accept(this);
            this.code.popObject(r.A0);
            const frameSize = this.functionMetadata[this.insideFunction].frameSize;
            const offset = frameSize -1;
            this.code.addi(r.T0, r.FP, -offset * 4);
            this.code.sw(r.A0, r.T0);
        }
        
        this.code.j(this.returnLabel);
        this.code.comment(`Return end`);
    }
}