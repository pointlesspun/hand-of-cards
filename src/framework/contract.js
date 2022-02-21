'use strict';

export const contract = { 
    requires : function(condition, message) {
        if (!condition) {
            throw message ?? "failed contract.requires";
        }
    },

    isDefined : function(value, message) {
        if (value === undefined) {
            throw message ?? "failed contract.isDefined";
        }
    },

    isNumber : function(value, message) {
        if (value === undefined || isNaN(value) ) {
            throw message ?? "failed contract.isNumber";
        }
    },

    isInRange : function(value, min, max, message) {
        if (value === undefined || isNaN(value) ) {
            throw message ?? `failed contract.isInRange; value (${value}) is not a number.`;
        }

        if (value < min || value >= max) {
            throw message ?? `failed contract.isInRange; number (${value} is not in range (${min} - ${max})`;
        }
    },

    isBoolean : function(value, message) {
        if (value === undefined || typeof value !== 'boolean' ) {
            throw message ?? "failed contract.isBoolean";
        }
    },

    isArray : function(value, message) {
        if (value === undefined || !Array.isArray(value) ) {
            throw message ?? "failed contract.isArray";
        }
    }
}

