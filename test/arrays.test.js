import { countInArray, partitionArray } from "../src/framework/arrays.js";

test("partition array in three parts.", () => {
    const upper = "upper";
    const lower = "lower";
    const other = "other";

    // partition an array in startsWithUpper, startsWithLower and other
    const result = partitionArray(["A", "b", "_", "1", "C", "d", ""], (str) => {
        if (str && str.length > 0 && str[0].toLowerCase() !== str[0].toUpperCase()) {
            if (str[0] === str[0].toUpperCase()) {
                return upper;
            } else if (str[0] === str[0].toLowerCase()) {
                return lower;
            }
        }

        return other;
    });

    expect(result[upper]).toEqual(["A", "C"]);
    expect(result[lower]).toEqual(["b", "d"]);
    expect(result[other]).toEqual(["_", "1", ""]);
});

test("count in array without max index.", () => {
    const arr = [1, 2, -1, 0, -2];

    expect(countInArray(arr, (number) => number > 0)).toBe(2);
    expect(countInArray(arr, (number) => number >= 0)).toBe(3);
    expect(countInArray(arr, (number) => number === 0)).toBe(1);
    expect(countInArray(arr, (number) => number <= 0)).toBe(3);
    expect(countInArray(arr, (number) => number < 0)).toBe(2);
});

test("count in array WITH A max index.", () => {
    const arr = [1, 2, -1, 0, -2];

    expect(countInArray(arr, (number) => number > 0, 1)).toBe(1);
    expect(countInArray(arr, (number) => number >= 0, 3)).toBe(2);
    expect(countInArray(arr, (number) => number === 0, 3)).toBe(0);
    expect(countInArray(arr, (number) => number <= 0, 10)).toBe(3);
    expect(countInArray(arr, (number) => number < 0, 0)).toBe(0);
});