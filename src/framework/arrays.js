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

/**
 * Expertly lifted from https://stackoverflow.com/a/12646864
 * @param {[any]} array 
 */
export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

/**
 * Create a new array and fill it with the factoryFunction's result
 * @param {number} length 
 * @param {*} factoryFunction 
 * @returns a new array of the given length 
 */
export function newArray(length, factoryFunction) {
    const result = new Array(length);

    for (let i = 0; i < length; i++) {
        result[i] = factoryFunction();
    }

    return result;
}