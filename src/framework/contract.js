"use strict";

export const contract = {
    requires: function (condition, message) {
        if (!condition) {
            throw new Error(message ?? "failed contract.requires");
        }
    },

    isDefined: function (value, message) {
        if (value === undefined) {
            throw new Error(message ?? "failed contract.isDefined");
        }
    },

    isNumber: function (value, message) {
        if (value === undefined || isNaN(value)) {
            throw new Error(message ?? "failed contract.isNumber");
        }
    },

    isInRange: function (value, min, max, message) {
        if (value === undefined || isNaN(value)) {
            throw new Error(message ?? `failed contract.isInRange; value (${value}) is not a number.`);
        }

        if (value < min || value >= max) {
            throw new Error(message ?? `failed contract.isInRange; number (${value} is not in range (${min} - ${max})`);
        }
    },

    isBoolean: function (value, message) {
        if (value === undefined || typeof value !== "boolean") {
            throw new Error(message ?? "failed contract.isBoolean");
        }
    },

    isString: function (value, message) {
        if (value === undefined || typeof value !== "string") {
            throw new Error(message ?? "failed contract.isString");
        }
    },

    isArray: function (value, message) {
        if (value === undefined || !Array.isArray(value)) {
            throw new Error(message ?? "failed contract.isArray");
        }
    },

    /**
     * 
     * @param {[*]} array 
     * @param {*} value 
     * @param {string} message 
     */
    contains: function (array, value, message) {
        if (array.findIndex(v => v === value) < 0) {
            throw new Error(message ?? "failed contract.contains");
        }
    },

    /**
     * 
     * @param {[*]} array 
     * @param {*} value 
     * @param {string} message 
     */
     doesNotContain: function (array, value, message) {
        if (array.findIndex(v => v === value) >= 0) {
            throw new Error(message ?? "failed contract.doesNotContain");
        }
    }
};
