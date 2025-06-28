import { Utils } from "@tspro/ts-utils-lib";
import { BigNumber, MathContext } from "bigmath";

declare global {
    namespace jasmine {
        interface Matchers<T> {
            toEqualSome(expected: BigNumber | BigNumber[]): boolean;
            toEqualInMc(expected: BigNumber, mc?: MathContext): boolean;
        }
    }
}

function isObject(obj: any) {
    return obj !== undefined && obj !== null && typeof obj === "object";
}

function eqValue(val1: unknown, val2: unknown) {
    return Number.isNaN(val1) && Number.isNaN(val2) || val1 === val2;
}

function eqObject(obj1: any, obj2: any) {
    if (!isObject(obj1) || !isObject(obj2)) {
        return eqValue(obj1, obj2);
    }
    else {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        if (keys1.length !== keys2.length) {
            return false;
        }
        for (const key of keys1) {
            if (!eqObject(obj1[key], obj2[key])) {
                return false;
            }
        }
        return true;
    }
}

function eqBigNumber(val1: BigNumber, val2: BigNumber, mc?: MathContext) {
    if (mc) {
        val1 = val1.convert(mc);
        val2 = val2.convert(mc);
    }
    return eqValue(val1.sign, val2.sign) &&
        eqObject(val1.digits, val2.digits) &&
        eqValue(val1.exponent, val2.exponent) &&
        eqValue(val1.mc.base, val2.mc.base);
}

function toStringBigNumber(x: BigNumber) {
    return x.toString(); // + " = " + JSON.stringify(x);
}

export const toEqualSomeMatcher = {
    toEqualSome: function () {
        return {
            compare: function (actual: BigNumber, expected: BigNumber | BigNumber[]): jasmine.CustomMatcherResult {
                expected = Utils.Arr.isArray(expected) ? expected : [expected];
                let pass = expected.some(e => eqBigNumber(e, actual));
                let message = "Expected " + toStringBigNumber(actual) + "\nTo be one of:\n" + expected.map(e => "    " + toStringBigNumber(e)).join("\n");
                return { pass, message };
            }
        }
    }
}

export const toEqualInMcMatcher = {
    toEqualInMc: function () {
        return {
            compare: function (actual: BigNumber, expected: BigNumber, mc?: MathContext): jasmine.CustomMatcherResult {
                let pass = eqBigNumber(actual, expected, mc);
                let message = "\n" + 
                    "Actual:   " + toStringBigNumber(actual) + "\n" +
                    "Expected: " + toStringBigNumber(expected) + "\n" +
                    (mc ? "In MC: " + JSON.stringify(mc) + "\n" : "");
                return { pass, message };
            }
        }
    }
}
