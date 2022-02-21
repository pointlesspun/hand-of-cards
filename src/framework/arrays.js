'use strict';

export function partitionArray(array, predicate) {

    const result = {};

    for (let i = 0; i < array.length; i++) {
        const key = predicate(array[i]);

        if (result[key]) {
            result[key].push(array[i]);
        } else {
            result[key] = [array[i]];
        }
    }

    return result;
}

export function countInArray(array, predicate, maxIndex = -1) {
    let result = 0;
    const max = maxIndex < 0 ? array.length : Math.min(array.length, maxIndex);

    for (let i = 0; i < max; i++) {
        if (predicate(array[i], i)) {
            result++;
        }

    }

    return result;
}