import { Assert, Utils } from "@tspro/ts-utils-lib";

const MaxBase = 36; // BigNumber.MaxBase

export namespace Helpers {

    export function validateBase(base: number): number {
        Assert.assert(Utils.Math.isInteger(base) && base >= 2 && base <= MaxBase, "Invalid base: " + base);
        return base;
    }

    export function validatePrecision(p: number) {
        Assert.assert(p === Infinity || Utils.Math.isInteger(p) && p >= 1, "Invalid precision: " + p);
        return p;
    }

    export function validateDecimalPlaces(dp: number) {
        Assert.assert(dp === Infinity || Utils.Math.isInteger(dp) && dp >= 0, "Invalid decimal places: " + dp);
        return dp;
    }

    export function getBaseName(base: number, longName: boolean): string {
        switch (base) {
            case 2: return longName ? "Binary" : "Bin";
            case 8: return longName ? "Octal" : "Oct";
            case 10: return longName ? "Decimal" : "Dec";
            case 16: return longName ? "Hexadecimal" : "Hex";
            default: return (longName ? "Base " : "B=") + base;
        }
    }

    /**
     * Get sign of value.
     * 
     * Returns -1 if value is negative (including -0).
     * 
     * Returns +1 if value is positive (including +0).
     * 
     * @param value 
     * @returns 
     */
    export function getSign(value: number): -1 | 1 {
        Assert.assert(!Number.isNaN(value));
        return value < 0 || value === 0 && 1 / value === -Infinity ? -1 : 1;
    }

    /**
     * In Javascript zero can be -0 or +0. This function will return zero with given sign.
     * 
     * Return -0 if sign is negative (including -0).
     * 
     * Return +0 if sign is positive (including +0).
     * 
     * @param sign 
     * @returns Returns -0 | +0
     */
    export function signedZero(sign: number): -0 | 0 {
        return getSign(sign) < 0 ? -0 : 0;
    }

    export function getRelativePrecision(base10precision: number, base: number): number {
        validatePrecision(base10precision);
        validateBase(base)
        return Math.ceil(base10precision / Math.log10(base));
    }

}