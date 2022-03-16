
exports.getRandomBytes = (length) => {
    return new Uint8Array(Array(length).fill().map(() => Math.floor(Math.random() * 256)));
}

exports.concatUint8Arrays = (...arrays) => {
    const totalLength = arrays.map(elem => elem.length).reduce((prev, cur) => prev + cur);

    const combined = new Uint8Array(totalLength);
    let pos = 0;

    arrays.forEach((each) => {
        combined.set(each, pos);
        pos += each.length;
    })

    return combined;
}

exports.sliceArrayByLength = (array, ...lengths) => {
    if (!array.slice) throw new Error('An array object must be parsed.');

    let pos = 0;

    const slicedArrays = lengths.map((len) => {
        if (len <= 0) throw new Error('Invalid length for sliced array.');
        const part = array.slice(pos, len + pos);
        pos += len;
        return part;
    });

    if (pos < array.length) slicedArrays.push(array.slice(pos));
    return slicedArrays;
}