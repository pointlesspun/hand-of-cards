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
    }
}