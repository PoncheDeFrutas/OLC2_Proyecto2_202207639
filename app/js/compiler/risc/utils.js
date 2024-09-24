export const stringTo32BitsArray = (str) => {
    const result = [];
    let index = 0, int = 0, shift = 0;

    for (index = 0; index < str.length; index++) {
        int |= (str.charCodeAt(index) << shift);
        shift += 8;

        if (shift >= 32) {
            result.push(int);
            shift = 0;
            int = 0;
        }
    }

    if (shift > 0) {
        result.push(int);
    }

    return result;
}
