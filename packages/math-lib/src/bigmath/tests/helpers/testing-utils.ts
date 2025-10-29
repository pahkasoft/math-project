import { Utils } from "@tspro/ts-utils-lib";

type CmpResult = { pass: boolean, message: string }

declare global {
    namespace jasmine {
        interface Matchers<T> {
            toEqualSome(expected: T[], expectationFailOutput?: any): boolean;
        }
    }
}

function isObject(object: any) {
    return object !== undefined && object !== null && typeof object === "object";
}

function deepEqual(object1: any, object2: any) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        const value1 = object1[key];
        const value2 = object2[key];

        const areObjects = isObject(value1) && isObject(value2);

        if (areObjects && !deepEqual(value1, value2) || !areObjects && value1 !== value2) {
            return false;
        }
    }

    return true;
}

export const toEqualSomeMatcher = {
    toEqualSome: function () {
        return {
            compare: function (actual: any, expected: any): CmpResult {
                let pass = Utils.Arr.toArray(expected).some((s: any) => deepEqual(s, actual));
                let message = "Expected \"" + actual + "\" to be in [" + expected.map((s: any) => "\"" + s + "\"") + "].";

                return { pass, message }
            }
        }
    }
}
