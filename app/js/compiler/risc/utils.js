export const stringTo32BitsArray = (str) => {
    const result = [];
    let buffer = 0, shift = 0;

    for (let i = 0; i < str.length; i++) {
        buffer |= (str.charCodeAt(i) << shift);
        shift += 8;

        if (shift === 32) {
            result.push(buffer);
            buffer = 0;
            shift = 0;
        }
    }

    if (shift > 0) {
        result.push(buffer);
    }

    return result;
}

export const stringTo1ByteArray = (str) => {
    const result = new Array(str.length + 1);

    for (let i = 0; i < str.length; i++) {
        result[i] = str.charCodeAt(i);
    }

    result[str.length] = 0;
    return result;
}
