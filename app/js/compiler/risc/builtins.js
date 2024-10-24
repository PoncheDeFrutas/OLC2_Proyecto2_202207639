import { registers as r } from "./constants.js";
import { Generator } from "./generator.js";

/**
 * @param {Generator} code
 */
export const jump = (code) => {
    code.comment(`Jump to address`);
    code.li(r.A0, 10);
    code.li(r.A7, 11);
    code.ecall();
}

/**
 * @param {Generator} code
 */
export const concatString = (code) => {
    code.comment(`Concatenation of strings`);

    code.add(r.A0, r.ZERO, r.T0);
    code.add(r.A1, r.ZERO, r.T1);
    
    const copyString = (source) => {
        const loopLabel = code.getLabel();
        const endLabel = code.getLabel();
        code.addLabel(loopLabel);

        code.lb(r.T1, source);
        code.beq(r.T1, r.ZERO, endLabel);
        code.sb(r.T1, r.HP);
        code.addi(r.HP, r.HP, 1);
        code.addi(source, source, 1);
        code.j(loopLabel);
        code.addLabel(endLabel);
    }

    code.push(r.HP);

    code.comment(`Copy string 1`);
    copyString(r.A0);
    
    code.comment(`Copy string 2`);
    copyString(r.A1);
    
    code.comment(`Add null terminator`);
    code.sb(r.ZERO, r.HP);
    code.addi(r.HP, r.HP, 1);
    
};

/**
 * @param {Generator} code
 */
export const compareString = (code) => {
    code.comment(`Comparison of strings`);
    
    code.add(r.A0, r.ZERO, r.T0);
    code.add(r.A1, r.ZERO, r.T1);
    
    const endLabel = code.getLabel();
    const equalLabel = code.getLabel();
    const notEqualLabel = code.getLabel();

    const loopLabel = code.getLabel();
    code.addLabel(loopLabel);

    code.lb(r.T1, r.A0);

    code.lb(r.T2, r.A1);

    code.bne(r.T1, r.T2, notEqualLabel);

    code.beq(r.T1, r.ZERO, equalLabel);

    code.addi(r.A0, r.A0, 1);
    code.addi(r.A1, r.A1, 1);

    code.j(loopLabel);

    code.addLabel(equalLabel);
    code.li(r.T0, 1);
    code.j(endLabel);

    code.addLabel(notEqualLabel);
    code.li(r.T0, 0);

    code.addLabel(endLabel);
    
    code.comment(`End of string comparison`);
};

/**
 * @param {Generator} code
 */
export const toLowerCase = (code) => {
    code.comment(`Lower case of character`);
    code.push(r.HP);
    
    code.add(r.A0, r.ZERO, r.T0);
    
    const end = code.getLabel();
    const loop = code.getLabel();
    const noConvert = code.getLabel();
    const convert = code.getLabel();
    const nextChar = code.getLabel();
    
    code.addLabel(loop);
    code.lb(r.T1, r.A0);
    code.beq(r.T1, r.ZERO, end);
    
    code.li(r.T2, 65);
    code.li(r.T3, 90);
    
    code.blt(r.T1, r.T2, noConvert);
    code.bgt(r.T1, r.T3, noConvert);
    
    code.j(convert);
    
    code.addLabel(noConvert);
    code.sb(r.T1, r.HP);
    
    code.addLabel(nextChar);
    code.addi(r.HP, r.HP, 1);
    code.addi(r.A0, r.A0, 1);
    code.j(loop);
    
    code.addLabel(convert);
    code.addi(r.T1, r.T1, 32);
    code.sb(r.T1, r.HP);
    
    code.j(nextChar);
    code.addLabel(end);
    code.sb(r.ZERO, r.HP);
    code.addi(r.HP, r.HP, 1);
    
    code.comment(`End of lower case conversion`);
}

/**
 * @param {Generator} code
 */
export const toUpperCase = (code) => {
    code.push(r.HP);

    code.add(r.A0, r.ZERO, r.T0);

    const end = code.getLabel();
    const loop = code.getLabel();
    const noConvert = code.getLabel();
    const convert = code.getLabel();
    const nextChar = code.getLabel();

    code.addLabel(loop);
    code.lb(r.T1, r.A0);
    code.beq(r.T1, r.ZERO, end);

    code.li(r.T2, 97);
    code.li(r.T3, 122);

    code.blt(r.T1, r.T2, noConvert);
    code.bgt(r.T1, r.T3, noConvert);

    code.j(convert);

    code.addLabel(noConvert);
    code.sb(r.T1, r.HP);

    code.addLabel(nextChar);
    code.addi(r.HP, r.HP, 1);
    code.addi(r.A0, r.A0, 1);
    code.j(loop);

    code.addLabel(convert);
    code.addi(r.T1, r.T1, -32);
    code.sb(r.T1, r.HP);

    code.j(nextChar);
    code.addLabel(end);
    code.sb(r.ZERO, r.HP);
    code.addi(r.HP, r.HP, 1);
}

/**
 * @param {Generator} code
 */
export const negBool = (code) => {
    code.comment(`Negation of booleans`);
    code.xori(r.T0, r.T0, 1);
    code.push();
}


/**
 * @param {Generator} code
 */
export const addInt = (code) => {
    code.comment(`Addition of integers`);
    code.add(r.T0, r.T0, r.T1);
    code.push();
}

/**
 * @param {Generator} code
 */
export const subInt = (code) => {
    code.comment(`Subtraction of integers`);
    code.sub(r.T0, r.T0, r.T1);
    code.push();
}

/**
 * @param {Generator} code
 */
export const mulInt = (code) => {
    code.comment(`Multiplication of integers`);
    code.mul(r.T0, r.T0, r.T1);
    code.push();
}

/**
 * @param {Generator} code
 */
export const divInt = (code) => {
    code.comment(`Division of integers`);
    code.div(r.T0, r.T0, r.T1);
    code.push();
}

/**
 * @param {Generator} code
 */
export const remInt = (code) => {
    code.comment(`Remainder of integers`);
    code.rem(r.T0, r.T0, r.T1);
    code.push();
}

/**
 * @param {Generator} code
 */
export const negInt = (code) => {
    code.comment(`Negation of integers`);
    code.neg(r.T0, r.T0);
    code.push();
}

/**
 * @param {Generator} code
 */
export const addFloat = (code) => {
    code.comment(`Addition of floats`);
    code.fadd(r.FT0, r.FT0, r.FT1);
    code.pushFloat();
}

/**
 * @param {Generator} code
 */
export const subFloat = (code) => {
    code.comment(`Subtraction of floats`);
    code.fsub(r.FT0, r.FT0, r.FT1);
    code.pushFloat();
}

/**
 * @param {Generator} code
 */
export const mulFloat = (code) => {
    code.comment(`Multiplication of floats`);
    code.fmul(r.FT0, r.FT0, r.FT1);
    code.pushFloat();
}

/**
 * @param {Generator} code
 */
export const divFloat = (code) => {
    code.comment(`Division of floats`);
    code.fdiv(r.FT0, r.FT0, r.FT1);
    code.pushFloat();
}

/**
 * @param {Generator} code
 */
export const negFloat = (code) => {
    code.comment(`Negation of floats`);
    code.fneg(r.FT0, r.FT0);
    code.pushFloat();
}

/**
 * @param {Generator} code
 */
export const remFloat = (code) => {
    code.comment(`Remainder of floats`);
    code.push();
}

/**
 * @param {Generator} code
 */
export const lessThanInt = (code) => {
    code.comment(`Less than comparison of integers`);
    code.slt(r.T0, r.T0, r.T1);
    code.push();
}

/**
 * @param {Generator} code
 */
export const greaterThanInt = (code) => {
    code.comment(`Greater than comparison of integers`);
    code.slt(r.T0, r.T1, r.T0);
    code.push();
}

/**
 * @param {Generator} code
 */
export const lessEqualInt = (code) => {
    code.comment(`Less or equal comparison of integers`);
    code.slt(r.T0, r.T1, r.T0);
    code.xori(r.T0, r.T0, 1);
    code.push();
}

/**
 * @param {Generator} code
 */
export const greaterEqualInt = (code) => {
    code.comment(`Greater or equal comparison of integers`);
    code.slt(r.T0, r.T0, r.T1);
    code.xori(r.T0, r.T0, 1);
    code.push();
}

/**
 * @param {Generator} code
 */
export const equalInt = (code) => {
    code.comment(`Equal comparison of integers`);
    code.sub(r.T0, r.T0, r.T1);
    code.sltiu(r.T0, r.T0, 1);
    code.push();
}

/**
 * @param {Generator} code
 */
export const notEqualInt = (code) => {
    code.comment(`Not equal comparison of integers`);
    code.sub(r.T0, r.T0, r.T1);
    code.sltu(r.T0, r.ZERO, r.T0);
    code.push();
}

/**
 * @param {Generator} code
 */
export const lessThanFloat = (code) => {
    code.comment(`Less than comparison of floats`);
    code.flt(r.T0, r.FT0, r.FT1);
    code.push();
}

/**
 * @param {Generator} code
 */
export const greaterThanFloat = (code) => {
    code.comment(`Greater than comparison of floats`);
    code.flt(r.T0, r.FT1, r.FT0);
    code.push();
}

/**
 * @param {Generator} code
 */
export const lessEqualFloat = (code) => {
    code.comment(`Less or equal comparison of floats`);
    code.fle(r.T0, r.FT0, r.FT1);
    code.push();
}

/**
 * @param {Generator} code
 */
export const greaterEqualFloat = (code) => {
    code.comment(`Greater or equal comparison of floats`);
    code.fle(r.T0, r.FT1, r.FT0);
    code.push();
}

/**
 * @param {Generator} code
 */
export const equalFloat = (code) => {
    code.comment(`Equal comparison of floats`);
    code.feq(r.T0, r.FT0, r.FT1);
    code.push();
}

/**
 * @param {Generator} code
 */
export const notEqualFloat = (code) => {
    code.comment(`Not equal comparison of floats`);
    code.feq(r.T0, r.FT0, r.FT1);
    code.xori(r.T0, r.T0, 1);
    code.push();
}

/**
 * @param {Generator} code
 */
export const andInt = (code) => {
    code.comment(`And operation of integers`);
    code.and(r.T0, r.T0, r.T1);
    code.push();
}

/**
 * @param {Generator} code
 */
export const orInt = (code) => {
    code.comment(`Or operation of integers`);
    code.or(r.T0, r.T0, r.T1);
    code.push();
}

/**
 * @param {Generator} code
 */
export const getElement = (code) => {
    code.comment(`Get element of array`);

    const l1 = code.getLabel();
    const l2 = code.getLabel();

    code.add(r.A0, r.ZERO, r.T0);

    code.addLabel(l1);
    code.beq(r.T1, r.ZERO, l2);
    code.addi(r.A0, r.A0, 4);
    code.addi(r.T1, r.T1, -1);
    code.j(l1);

    code.addLabel(l2);
    code.add(r.T2, r.ZERO, r.ZERO);

    code.lbu(r.T3, r.A0);
    code.or(r.T2, r.T2, r.T3);

    for (let i = 1; i < 4; i++) {
        code.addi(r.A0, r.A0, 1);
        code.lbu(r.T3, r.A0);
        code.slli(r.T3, r.T3, 8 * i);
        code.or(r.T2, r.T2, r.T3);
    }

    //code.mv(r.T0, r.T2);
    code.push(r.T2);
}

/**
 * @param {Generator} code
 */
export const setElement = (code) => {
    code.comment(`Set element of array`);

    const l1 = code.getLabel();
    const l2 = code.getLabel();

    code.add(r.A0, r.ZERO, r.T0);

    code.addLabel(l1);
    code.beq(r.T1, r.ZERO, l2);
    code.addi(r.A0, r.A0, 4);
    code.addi(r.T1, r.T1, -1);
    code.j(l1);

    code.addLabel(l2);

    for (let i = 0; i < 4; i++) {
        code.srli(r.T1, r.T2, i*8);
        code.sb(r.T1, r.A0, i);
    }

    code.push(r.T2);
}

/**
 * @param {Generator} code
 */
export const instance = (code) => {
    for (let j = 0; j < 4; j++) {
        code.srli(r.T1, r.T0, j*8);
        code.sb(r.T1, r.HP, j);
    }
    code.addi(r.HP, r.HP, 4);
}

/**
 * @param {Generator} code
 */
export const copyVector = (code) => {
    code.push(r.HP);

    const l1 = code.getLabel();
    const l2 = code.getLabel();

    code.add(r.A0, r.ZERO, r.T0);

    code.addLabel(l1);
    code.beq(r.T1, r.ZERO, l2);
    code.lb(r.T2, r.A0)
    code.sb(r.T2, r.HP);
    code.addi(r.HP, r.HP, 1);
    code.addi(r.A0, r.A0, 1);
    code.addi(r.T1, r.T1, -1);
    code.j(l1);

    code.addLabel(l2);
}

/**
 * @param {Generator} code
 */
export const indexOf = (code) => {
    code.comment(`Get index of element in array`);

    const l1 = code.getLabel();
    const l2 = code.getLabel();
    const l3 = code.getLabel();

    code.add(r.T2, r.ZERO, r.ZERO);
    code.add(r.A0, r.ZERO, r.T0);
    code.add(r.T4, r.ZERO, r.ZERO);

    code.addLabel(l1);

    code.lbu(r.T2, r.A0, 0);

    for (let i = 1; i < 4; i++) {
        code.addi(r.A0, r.A0, 1);
        code.lbu(r.T3, r.A0, 0);
        code.slli(r.T3, r.T3, 8 * i);
        code.or(r.T2, r.T2, r.T3);
    }

    code.beq(r.T2, r.T1, l2);

    code.addi(r.A0, r.A0, 1);
    code.addi(r.T4, r.T4, 1);

    code.bne(r.T4, r.T5, l1);
    code.j(l3);

    code.addLabel(l2);
    code.push(r.T4);
    code.ret();

    code.addLabel(l3);
    code.li(r.T0, -1);
    code.push(r.T0);
}

/**
 * @param {Generator} code
 */
export const parseInt = (code) => {
    code.comment(`Parse integer from string`);
    
    const l1 = code.getLabel();
    const l2 = code.getLabel();
    
    code.add(r.A0, r.ZERO, r.T0);
    code.li(r.T0, 0);
    code.li(r.T1, 0);
    code.li(r.T2, 46);
    code.li(r.T3, 10)
    
    code.addLabel(l1);
    code.lb(r.T1, r.A0);
    code.beq(r.T1, r.ZERO, l2);
    code.beq(r.T1, r.T2, l2);
    code.addi(r.T1, r.T1, -48);
    
    code.mul(r.T0, r.T0, r.T3);
    code.add(r.T0, r.T0, r.T1);
    code.addi(r.A0, r.A0, 1);
    code.j(l1);
    
    code.addLabel(l2);
    code.push();
}

/**
 * @param {Generator} code
 */
export const parsefloat = (code) => {
    code.comment(`Parse Float from string`);

    const l1 = code.getLabel();
    const l2 = code.getLabel();
    const l3 = code.getLabel();
    
    code.add(r.A0, r.ZERO, r.T0);
    code.li(r.T0, 0);
    code.li(r.T1, 0);
    code.li(r.T2, 46);
    code.li(r.T3, 10);
    code.li(r.T4, 1);
    code.fcvtsw(r.FT0, r.T0);
    code.fcvtsw(r.FT2, r.T4);
    code.fcvtsw(r.FT3, r.T3);

    code.addLabel(l1);
    code.lb(r.T1, r.A0);
    code.addi(r.A0, r.A0, 1);
    code.beq(r.T1, r.ZERO, l3);
    code.beq(r.T1, r.T2, l2);
    code.addi(r.T1, r.T1, -48);

    code.fcvtsw(r.FT1, r.T1);
    code.fmul(r.FT0, r.FT0, r.FT3);
    code.fadd(r.FT0, r.FT0, r.FT1);
    code.j(l1);

    code.addLabel(l2);
    code.lb(r.T1, r.A0);
    code.addi(r.A0, r.A0, 1);
    code.beq(r.T1, r.ZERO, l3);
    code.addi(r.T1, r.T1, -48);
    
    code.fcvtsw(r.FT1, r.T1);
    code.fmul(r.FT2, r.FT2, r.FT3);
    code.fdiv(r.FT1, r.FT1, r.FT2);
    code.fadd(r.FT0, r.FT0, r.FT1);
    code.j(l2);
    
    code.addLabel(l3);
    
    code.pushFloat();
}

/**
 * @param {Generator} code
 */
export const typeoff = (code) => {
    code.comment(`Get type of variable`);
    code.push(r.A1);
}

/**
 * @param {Generator} code
 */
export const printInt = (code) => {
    code.li(r.A7, 1);
    code.ecall();
}

/**
 * @param {Generator} code
 */
export const printFloat = (code) => {
    code.li(r.A7, 2);
    code.ecall();
}

/**
 * @param {Generator} code
 */
export const printChar = (code) => {
    code.li(r.A7, 11);
    code.ecall();
}

/**
 * @param {Generator} code
 */
export const printString = (code) => {
    code.li(r.A7, 4);
    code.ecall();
}

/**
 * @param {Generator} code
 */
export const printBool = (code) => {
    const l1 = code.getLabel();
    
    code.la(r.A1, 'false');
    code.beq(r.A0, r.ZERO, l1);
    code.la(r.A1, 'true');

    code.addLabel(l1);
    code.mv(r.A0, r.A1);
    code.li(r.A7, 4);
    code.ecall();
}

/**
 * @param {Generator} code
 */
export const intToString = (code) => {
    const count = code.getLabel();
    const endCount = code.getLabel();
    const zeroCase = code.getLabel();
    const loop = code.getLabel();
    const storeLoop = code.getLabel();
    
    code.push(r.HP);  
    code.li(r.T2, 10);    

    code.beqz(r.T0, zeroCase);

    code.mv(r.T3, r.T0);
    code.li(r.T4, 0);

    code.addLabel(count);
    code.beqz(r.T3, endCount);
    code.div(r.T3, r.T3, r.T2);
    code.addi(r.T4, r.T4, 1);
    code.j(count);

    code.addLabel(endCount);

    code.addLabel(loop);
    code.rem(r.T3, r.T0, r.T2);   
    code.addi(r.T3, r.T3, 48);
    code.push(r.T3);
    //code.sb(r.T3, r.HP);          
    //code.addi(r.HP, r.HP, 1);     
    code.div(r.T0, r.T0, r.T2);   
    code.bnez(r.T0, loop);        

    //Loop haciendo pop guardando los caracteres en el hp
    code.addLabel(storeLoop);
    code.pop(r.T3);
    code.sb(r.T3, r.HP);
    code.addi(r.HP, r.HP, 1);
    code.addi(r.T4, r.T4, -1);
    code.bnez(r.T4, storeLoop);
    
    code.sb(r.ZERO, r.HP);
    code.addi(r.HP, r.HP, 1);

    code.ret();

    code.addLabel(zeroCase);
    code.li(r.T0, 48);            
    code.sb(r.T0, r.HP);          
    code.addi(r.HP, r.HP, 1);
    code.sb(r.ZERO, r.HP);        
    code.addi(r.HP, r.HP, 1);
}

/**
 * @param {Generator} code
 */
export const boolToString = (code) => {
    const l1 = code.getLabel();

    code.la(r.A1, 'false');
    code.beq(r.T0, r.ZERO, l1);
    code.la(r.A1, 'true');
    code.addLabel(l1);
    code.push(r.A1);
}

/**
 * @param {Generator} code
 */
export const floatToString = (code) => {
    
}


/**
 * @param {Generator} code
 */
export const toString = (code) => {
}

export const builtin = {
    jump: jump,
    concatString: concatString,
    compareString: compareString,
    negBool: negBool,
    addInt: addInt,
    subInt: subInt,
    mulInt: mulInt,
    divInt: divInt,
    remInt: remInt,
    negInt: negInt,
    addFloat: addFloat,
    subFloat: subFloat,
    mulFloat: mulFloat,
    divFloat: divFloat,
    negFloat: negFloat,
    remFloat: remFloat,
    lessThanInt: lessThanInt,
    greaterThanInt: greaterThanInt,
    lessEqualInt: lessEqualInt,
    greaterEqualInt: greaterEqualInt,
    equalInt: equalInt,
    notEqualInt: notEqualInt,
    lessThanFloat: lessThanFloat,
    greaterThanFloat: greaterThanFloat,
    lessEqualFloat: lessEqualFloat,
    greaterEqualFloat: greaterEqualFloat,
    equalFloat: equalFloat,
    notEqualFloat: notEqualFloat,
    andInt: andInt,
    orInt: orInt,
    getElement: getElement,
    setElement: setElement,
    instance: instance,
    copyVector: copyVector,
    indexOf: indexOf,
    parseInt: parseInt,
    parsefloat: parsefloat,
    typeof: typeoff,
    printInt: printInt,
    printBool: printBool,
    printChar: printChar,
    printString: printString,
    printFloat: printFloat,
    toLowerCase: toLowerCase,
    toUpperCase: toUpperCase,
    intToString: intToString,
    boolToString: boolToString,
    toString: toString,
    floatToString: floatToString
}