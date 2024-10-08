import { registers as r } from "./constants.js";
import { Generator } from "./generator.js";

/**
 * @param {Generator} code
 */
export const concatString = (code) => {
    code.comment(`Concatenation of strings`);

    const copyString = (sourceReg) => {
        const endLabel = code.getLabel();
        const loopLabel = code.getLabel();

        code.addLabel(loopLabel);

        code.lb(r.T1, sourceReg);

        code.beq(r.T1, r.ZERO, endLabel);

        code.sb(r.T1, r.HP);
        code.addi(r.HP, r.HP, 1);
        code.addi(sourceReg, sourceReg, 1);

        code.j(loopLabel);

        code.addLabel(endLabel);
    };

    code.push(r.HP);

    copyString(r.A1);

    copyString(r.A0);

    code.sb(r.ZERO, r.HP);
    code.addi(r.HP, r.HP, 1);

};


/**
 * @param {Generator} code
 */
export const compareString = (code) => {
    code.comment(`Comparison of strings`);

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
    code.li(r.T0, 0);
    code.j(endLabel);

    code.addLabel(notEqualLabel);
    code.li(r.T0, 1);

    code.addLabel(endLabel);

    code.push();
};


export const builtin = {
    concatString: concatString,
    compareString: compareString,
}