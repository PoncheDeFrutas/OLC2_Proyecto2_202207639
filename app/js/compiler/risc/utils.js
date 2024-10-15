export const stringTo1ByteArray = (str) => {
    const result = new Array(str.length + 1);

    for (let i = 0; i < str.length; i++) {
        result[i] = str.charCodeAt(i);
    }
    
    result[str.length] = 0;
    return result;
}

export const  floatToHex = (num) => {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setFloat32(0, num, true);

    const integer = view.getUint32(0, true);
    return `0x${integer.toString(16)}`;
}

/**
 * @param {Generator} code
 * @param first
 * @param r1
 * @param r2
 */
export const handlePopObject = (code, r1, r2, first = true) => {
    const isFloat = code.getTopObject(first).type === 'float';
    return code.popObject(isFloat ? r2 : r1);
};
