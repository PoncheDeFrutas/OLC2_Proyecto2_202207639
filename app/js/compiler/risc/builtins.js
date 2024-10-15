import { registers as r } from "./constants.js";
import { Generator } from "./generator.js";

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
    
    this.code.add(r.A0, r.ZERO, r.T0);
    this.code.add(r.A1, r.ZERO, r.T1);
    
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
    code.fadd(r.FT0, r.FT1, r.FT0);
    code.pushFloat();
}

/**
 * @param {Generator} code
 */
export const subFloat = (code) => {
    code.comment(`Subtraction of floats`);
    code.fsub(r.FT0, r.FT1, r.FT0);
    code.pushFloat();
}

/**
 * @param {Generator} code
 */
export const mulFloat = (code) => {
    code.comment(`Multiplication of floats`);
    code.fmul(r.FT0, r.FT1, r.FT0);
    code.pushFloat();
}

/**
 * @param {Generator} code
 */
export const divFloat = (code) => {
    code.comment(`Division of floats`);
    code.fdiv(r.FT0, r.FT1, r.FT0);
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
    code.slt(r.T0, r.T0, r.T1);
    code.push();
}

/**
 * @param {Generator} code
 */
export const lessEqualInt = (code) => {
    code.comment(`Less or equal comparison of integers`);
    code.slt(r.T0, r.T0, r.T1);
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
    code.flt(r.T0, r.FT1, r.FT0);
    code.push();
}

/**
 * @param {Generator} code
 */
export const greaterThanFloat = (code) => {
    code.comment(`Greater than comparison of floats`);
    code.flt(r.T0, r.FT0, r.FT1);
    code.push();
}

/**
 * @param {Generator} code
 */
export const lessEqualFloat = (code) => {
    code.comment(`Less or equal comparison of floats`);
    code.fle(r.T0, r.FT1, r.FT0);
    code.push();
}

/**
 * @param {Generator} code
 */
export const greaterEqualFloat = (code) => {
    code.comment(`Greater or equal comparison of floats`);
    code.fle(r.T0, r.FT0, r.FT1);
    code.push();
}

/**
 * @param {Generator} code
 */
export const equalFloat = (code) => {
    code.comment(`Equal comparison of floats`);
    code.feq(r.T0, r.FT1, r.FT0);
    code.push();
}

/**
 * @param {Generator} code
 */
export const notEqualFloat = (code) => {
    code.comment(`Not equal comparison of floats`);
    code.feq(r.T0, r.FT1, r.FT0);
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


export const builtin = {
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
    orInt: orInt
}