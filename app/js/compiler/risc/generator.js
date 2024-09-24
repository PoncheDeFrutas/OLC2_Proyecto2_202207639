import {registers as r} from "./constants.js";
import {stringTo32BitsArray} from "./utils.js";

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
        this.instructions = [];
        this.objectStack = [];
        this.depth = 0;
    }

    add(rd, rs1, rs2) {
        this.instructions.push(new Instruction('add', rd, rs1, rs2));
    }

    sub(rd, rs1, rs2) {
        this.instructions.push(new Instruction('sub', rd, rs1, rs2));
    }

    mul(rd, rs1, rs2) {
        this.instructions.push(new Instruction('mul', rd, rs1, rs2));
    }

    div(rd, rs1, rs2) {
        this.instructions.push(new Instruction('div', rd, rs1, rs2));
    }

    rem(rd, rs1, rs2) {
        this.instructions.push(new Instruction('rem', rd, rs1, rs2));
    }

    addi(rd, rs1, imm) {
        this.instructions.push(new Instruction('addi', rd, rs1, imm));
    }

    sw(rs1, rs2, imm = 0) {
        this.instructions.push(new Instruction('sw', rs1, `${imm}(${rs2})`));
    }

    lw(rd, rs1, imm = 0) {
        this.instructions.push(new Instruction('lw', rd, `${imm}(${rs1})`));
    }

    li(rd, imm) {
        this.instructions.push(new Instruction('li', rd, imm));
    }

    push(rd = r.T0) {
        this.addi(r.SP, r.SP, -4);
        this.sw(rd, r.SP);
    }

    pop(rd = r.T0) {
        this.lw(rd, r.SP);
        this.addi(r.SP, r.SP, 4);
    }

    ecall() {
        this.instructions.push(new Instruction('ecall'));
    }

    printInt(rd = r.A0) {
        if (rd !== r.A0) {
            this.push(r.A0);
            this.add(r.A0, rd, r.ZERO);
        }
        this.li(r.A7, 1);
        this.ecall();

        if (rd !== r.A0) {
            this.pop(r.A0);
        }
    }
    
    printString(rd = r.A0) {
        if (rd !== r.A0) {
            this.push(r.A0);
            this.add(r.A0, rd, r.ZERO);
        }
        this.li(r.A7, 4);
        this.ecall();

        if (rd !== r.A0) {
            this.pop(r.A0);
        }
    }

    endProgram() {
        this.li(r.A7, 10);
        this.ecall();
    }

    comment(comment) {
        this.instructions.push(new Instruction(`# ${comment}`));
    }
    
    pushConstant(object) {
        
        switch (object.type) {
            case 'int':
                this.li(r.T0, object.value);
                this.push();
                break;
            case 'string':
                const stringArray = stringTo32BitsArray(object.value);
                
                this.comment(`String: ${object.value}`);
                
                this.addi(r.T0, r.HP, 4);
                this.push(r.T0);
                
                stringArray.forEach((block32bits) => {
                    this.li(r.T0, block32bits);
                    this.addi(r.HP, r.HP, 4);
                    this.sw(r.T0, r.HP);
                });
                
                break;
            default:
                break;
        }
        
        this.pushObject({type: object.type, length:4, depth:this.depth})
    }
    
    pushObject(object) {
        this.objectStack.push(object)
    }
    
    popObject(rd = r.T0) {
        const object = this.objectStack.pop()
        /*
        switch (object.type) {
            case 'int':
                this.pop(rd)
                break;
            case 'string':
                this.pop(rd)
                break;
            default:
                break;
        }*/
        
        this.pop(rd)
        return object
    }

    newScope(){
        this.depth++
    }
    
    endScope() {
        let offset = 0;
        for (let i = this.objectStack.length - 1; i >= 0; i--) {
            if (this.objectStack[i].depth === this.depth) {
                offset += this.objectStack[i].length;
                this.objectStack.pop()
            } else {
                break;
            }
        }

        this.depth--
        return offset;
    }

    tagObject(id) {
        this.objectStack[this.objectStack.length - 1].tag = id
    }

    getObject(id) {
        let offset = 0;
        for (let i = this.objectStack.length - 1; i >= 0; i--) {
            if (this.objectStack[i].tag === id) {
                return [offset, this.objectStack[i]]
            }
            offset += this.objectStack[i].length
        }

        throw new Error(`Object with tag ${id} not found`)
    }

    toString() {
        this.endProgram()
        return `
.data
    heap:
.text

# initialize heap pointer
    la ${r.HP}, heap
main:
${this.instructions.map(i => `${i}`).join('\n')}
`
    }
}