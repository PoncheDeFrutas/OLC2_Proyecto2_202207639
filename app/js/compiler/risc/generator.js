import {registers as r} from "./constants.js";
import {stringTo1ByteArray, floatToHex} from "./utils.js";
import {builtin} from "./builtins.js";

class Instruction {
    constructor(instruction, rd, rs1, rs2) {
        this.instruction = instruction;
        this.rd = rd;
        this.rs1 = rs1;
        this.rs2 = rs2;
    }

    toString() {
        const operands = []
        if (this.rd !== undefined) operands.push(this.rd);
        if (this.rs1 !== undefined) operands.push(this.rs1);
        if (this.rs2 !== undefined) operands.push(this.rs2);
        return `${this.instruction} ${operands.join(', ')}`;
    }
}

export class Generator {
    constructor() {
        this.depth = 0;
        this.objectStack = [];
        this.instrucctions = [];

        this._labelCounter = 0;
        this._usedBuiltins = new Set();
        this.breakLabel = [];
        this.continueLabel = [];
    }
    
    getTopObject(first = true) {
        return first ? this.objectStack[this.objectStack.length - 1] : this.objectStack[this.objectStack.length - 2];
    }

    getLabel() {
        return `L${this._labelCounter++}`;
    }

    addLabel(label) {
        label = label || this.getLabel();
        this.instrucctions.push(new Instruction(`${label}:`));
        return label;
    }
    
    pushBreakLabel(label) {
        this.breakLabel.push(label);
    }
    
    pushContinueLabel(label) {
        this.continueLabel.push(label);
    }
    
    popBreakLabel() {
        return this.breakLabel.pop();
    }
    
    popContinueLabel() {
        return this.continueLabel.pop();
    }

    // Arithmetic Operations
    add(rd, rs1, rs2) {
        this.instrucctions.push(new Instruction('add', rd, rs1, rs2));
    }

    sub(rd, rs1, rs2) {
        this.instrucctions.push(new Instruction('sub', rd, rs1, rs2));
    }

    mul(rd, rs1, rs2) {
        this.instrucctions.push(new Instruction('mul', rd, rs1, rs2));
    }

    div(rd, rs1, rs2) {
        this.instrucctions.push(new Instruction('div', rd, rs1, rs2));
    }

    rem(rd, rs1, rs2) {
        this.instrucctions.push(new Instruction('rem', rd, rs1, rs2));
    }
    
    neg(rd, rs1) {
        this.instrucctions.push(new Instruction('neg', rd, rs1));
    }

    addi(rd, rs1, imm) {
        this.instrucctions.push(new Instruction('addi', rd, rs1, imm));
    }
    
    // Float Arithmetic Operations
    fadd(rd, rs1, rs2) {
        this.instrucctions.push(new Instruction('fadd.s', rd, rs1, rs2));
    }
    
    fsub(rd, rs1, rs2) {
        this.instrucctions.push(new Instruction('fsub.s', rd, rs1, rs2));
    }
    
    fmul(rd, rs1, rs2) {
        this.instrucctions.push(new Instruction('fmul.s', rd, rs1, rs2));
    }
    
    fdiv(rd, rs1, rs2) {
        this.instrucctions.push(new Instruction('fdiv.s', rd, rs1, rs2));
    }
    
    fneg(rd, rs1) {
        this.instrucctions.push(new Instruction('fneg.s', rd, rs1));
    }
    
    // Relational Operations
    slt(rd, rs1, rs2) {
        this.instrucctions.push(new Instruction('slt', rd, rs1, rs2));
    }

    sltu(rd, rs1, rs2) {
        this.instrucctions.push(new Instruction('sltu', rd, rs1, rs2));
    }

    sltiu(rd, rs1, imm) {
        this.instrucctions.push(new Instruction('sltiu', rd, rs1, imm));
    }
    
    // Float Relational Operations
    flt(rd, rs1, rs2) {
        this.instrucctions.push(new Instruction('flt.s', rd, rs1, rs2));
    }
    
    fle(rd, rs1, rs2) {
        this.instrucctions.push(new Instruction('fle.s', rd, rs1, rs2));
    }
    
    feq(rd, rs1, rs2) {
        this.instrucctions.push(new Instruction('feq.s', rd, rs1, rs2));
    }

    // Logical Operations
    xor(rd, rs1, rs2) {
        this.instrucctions.push(new Instruction('xor', rd, rs1, rs2));
    }

    xori(rd, rs1, imm) {
        this.instrucctions.push(new Instruction('xori', rd, rs1, imm));
    }

    or(rd, rs1, rs2) {
        this.instrucctions.push(new Instruction('or', rd, rs1, rs2));
    }

    ori(rd, rs1, imm) {
        this.instrucctions.push(new Instruction('ori', rd, rs1, imm));
    }

    and(rd, rs1, rs2) {
        this.instrucctions.push(new Instruction('and', rd, rs1, rs2));
    }

    andi(rd, rs1, imm) {
        this.instrucctions.push(new Instruction('andi', rd, rs1, imm));
    }

    // Store and Load
    sw(rs1, rs2, imm = 0) {
        this.instrucctions.push(new Instruction('sw', rs1, `${imm}(${rs2})`));
    }

    sb(rs1, rs2, imm = 0) {
        this.instrucctions.push(new Instruction('sb', rs1, `${imm}(${rs2})`));
    }

    lw(rd, rs1, imm = 0) {
        this.instrucctions.push(new Instruction('lw', rd, `${imm}(${rs1})`));
    }

    lb(rd, rs1, imm = 0) {
        this.instrucctions.push(new Instruction('lb', rd, `${imm}(${rs1})`));
    }

    la(rd, label) {
        this.instrucctions.push(new Instruction('la', rd, label));
    }

    li(rd, imm) {
        this.instrucctions.push(new Instruction('li', rd, imm));
    }
    
    // Store and Load Float
    fsw(rs1, rs2, imm = 0) {
        this.instrucctions.push(new Instruction('fsw', rs1, `${imm}(${rs2})`));
    }
    
    flw(rd, rs1, imm = 0) {
        this.instrucctions.push(new Instruction('flw', rd, `${imm}(${rs1})`));
    }

    fcvtsw(rd, rs1) {
        this.instrucctions.push(new Instruction('fcvt.s.w', rd, rs1));
    }
    
    fcvtws(rd, rs1) {
        this.instrucctions.push(new Instruction('fcvt.w.s', rd, rs1));
    }
    
    fmv(rd, rs1) {
        this.instrucctions.push(new Instruction('fmv', rd, rs1));
    }
    
    fli(rd, imm) {
        this.instrucctions.push(new Instruction('fli', rd, imm));
    }

    // Conditional Branches
    beq(rs1, rs2, label) {
        this.instrucctions.push(new Instruction('beq', rs1, rs2, label));
    }

    bne(rs1, rs2, label) {
        this.instrucctions.push(new Instruction('bne', rs1, rs2, label));
    }

    // Push and Pop
    push(rd = r.T0) {
        this.addi(r.SP, r.SP, -4);
        this.sw(rd, r.SP);
    }
    
    pushFloat(rd = r.FT0) {
        this.addi(r.SP, r.SP, -4);
        this.fsw(rd, r.SP);
    }

    pushConstant(object) {
        let value;

        switch (object.type) {
            case 'int':
                value = object.value;
                break;
            case 'bool':
                value = object.value ? 1 : 0;
                break;
            case 'char':
                value = object.value.charCodeAt(0);
                break;
            case 'float':
                value = floatToHex(object.value);
                break;
            case 'string':
                const stringArray = stringTo1ByteArray(object.value);
                this.comment(`Pushing string "${object.value}"`);
                this.push(r.HP);
                for (let i = 0; i < stringArray.length; i++) {
                    this.li(r.T0, stringArray[i]);
                    this.sb(r.T0, r.HP);
                    this.addi(r.HP, r.HP, 1);
                }
                break;
            default:
                return;
        }

        if (object.type !== 'string') {
            this.li(r.T0, value);
            this.push();
        }

        const length = 4;
        this.pushObject({type: object.type, length, depth: this.depth});
    }

    pushObject(object) {
        this.objectStack.push(object);
    }

    pop(rd = r.T0) {
        this.lw(rd, r.SP);
        this.addi(r.SP, r.SP, 4);
    }
    
    popFloat(rd = r.FT0) {
        this.flw(rd, r.SP);
        this.addi(r.SP, r.SP, 4);
    }

    popObject(rd = r.T0) {
        const object = this.objectStack.pop();
        object.type !== 'float' ? this.pop(rd) : this.popFloat(rd);
        return object;
    }

    // Function calls
    jal(label) {
        this.instrucctions.push(new Instruction('jal', label));
    }

    j(label) {
        this.instrucctions.push(new Instruction('j', label));
    }

    ret() {
        this.instrucctions.push(new Instruction('ret'));
    }

    // System calls
    ecall() {
        this.instrucctions.push(new Instruction('ecall'));
    }

    // Prints
    print(rd = r.A0, A7) {
        if (rd !== r.A0) {
            this.push(r.A0);
            this.add(r.A0, rd, r.ZERO);
        }

        this.li(r.A7, A7);
        this.ecall();

        if (rd !== r.A0) {
            this.pop(r.A0);
        }
    }

    printInt(rd = r.A0) {
        this.print(rd, 1);
    }

    printFloat(rd = r.A0) {
        this.print(rd, 2);
    }

    printChar(rd = r.A0) {
        this.print(rd, 11);
    }

    printString(rd = r.A0) {
        this.print(rd, 4);
    }

    // Comments
    comment(comment) {
        this.instrucctions.push(new Instruction(`# ${comment}`));
    }

    // End program
    endProgram() {
        this.li(r.A7, 10);
        this.ecall();
    }

    // Environment
    newScope() {
        this.depth++;
    }

    endScope() {
        let bytesToPop = 0;
        let index = this.objectStack.length - 1;

        while (index >= 0 && this.objectStack[index].depth === this.depth) {
            bytesToPop += this.objectStack[index].length;
            index--;
        }

        this.objectStack.splice(index + 1, this.objectStack.length - (index + 1));

        this.depth--;

        return bytesToPop;
    }

    tagObject(id) {
        this.objectStack[this.objectStack.length - 1].id = id;
    }

    getObject(id) {
        let byteOffset = 0;
        for (let i = this.objectStack.length - 1; i >= 0; i--) {
            if (this.objectStack[i].id === id) {
                return [byteOffset, this.objectStack[i]];
            }
            byteOffset += this.objectStack[i].length;
        }

        throw new Error(`Object with id ${id} not found`);
    }

    callBuiltin(name) {
        if (!builtin[name]) {
            throw new Error(`Builtin function ${name} not found`);
        }
        this._usedBuiltins.add(name);
        this.jal(name);
    }

    toString() {
        this.comment('End of program');
        this.endProgram();
        this.comment('Builtins');

        Array.from(this._usedBuiltins).forEach(name => {
            this.addLabel(name);
            builtin[name](this);
            this.ret();
        });

        return `
.data
    heap:
.text
# Initialize Heap Pointer
la ${r.HP}, heap

main:
${this.instrucctions.map(instruction => instruction.toString()).join('\n')}             
`
    }
}