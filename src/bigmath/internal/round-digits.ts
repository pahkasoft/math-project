import { NumberProps } from "../bignumber";
import { Helpers } from "../helpers";
import { RoundingMode } from "../mathcontext";
import { Assert, Utils } from "@tspro/ts-utils-lib";
import { eqDigits } from "./utils";

function trimDigits(props: NumberProps) {
    if (props.digits === undefined || Number.isNaN(props.exponent)) {
        return;
    }
    while (props.digits.length > 1 && props.digits[0] === 0) {
        props.digits.shift();
    }
    while (props.digits.length > 1 && props.digits[props.digits.length - 1] === 0) {
        props.digits.pop();
        props.exponent++;
    }
    if (props.digits.length === 0) {
        props.digits.push(0);
        props.exponent = 0;
    }
    else if (props.digits.length === 1 && props.digits[0] === 0) {
        props.exponent = 0;
    }
}

export function roundDigits(props: NumberProps, precision: { significantDigits?: number, decimalPlaces?: number }, rm: RoundingMode): void {
    Assert.assert(RoundingMode[rm] !== undefined, "Invalid rounding mode: " + rm);

    trimDigits(props);

    if (Number.isNaN(props.sign) || Number.isNaN(props.exponent) || props.digits === undefined || eqDigits(props.digits, [0])) {
        return;
    }

    let removeDigitCount: number;

    if (precision.significantDigits !== undefined) {
        Assert.assert(precision.decimalPlaces === undefined);
        removeDigitCount = props.digits.length - Helpers.validatePrecision(precision.significantDigits);
    }
    else if (precision.decimalPlaces !== undefined) {
        Assert.assert(precision.significantDigits === undefined);
        let currentDp = Math.max(0, -props.exponent);
        removeDigitCount = currentDp - Helpers.validateDecimalPlaces(precision.decimalPlaces);
    }
    else {
        Assert.interrupt();
    }

    if (removeDigitCount <= 0) {
        return;
    }

    let { base } = props.mc;

    let digitId = props.digits.length - removeDigitCount;
    let roundUp: boolean;

    if (rm === RoundingMode.HalfDown || rm === RoundingMode.HalfEven || rm === RoundingMode.HalfUp) {
        let digit = props.digits[digitId] ?? 0;
        let halfWayDigit = base / 2;
        let isHalfWayCase = Utils.Math.isInteger(halfWayDigit) && digit === halfWayDigit;
        switch (rm) {
            case RoundingMode.HalfDown:
                roundUp = digit > halfWayDigit && !isHalfWayCase;
                break;
            case RoundingMode.HalfEven: {
                let prevDigit = props.digits[digitId - 1] ?? 0;
                roundUp = digit > halfWayDigit || isHalfWayCase && prevDigit % 2 === 1;
                break;
            }
            case RoundingMode.HalfUp:
                roundUp = digit > halfWayDigit || isHalfWayCase;
                break;
        }
    }
    else {
        // Last digit is always non-zero. Also removeDigitCount > 0.
        // So will remove always some non zero digits thus need rounding.
        switch (rm) {
            case RoundingMode.Up:
                roundUp = true;
                break;
            case RoundingMode.Down:
                roundUp = false;
                break;
            case RoundingMode.Floor:
                roundUp = props.sign < 0;
                break;
            case RoundingMode.Ceil:
                roundUp = props.sign > 0;
                break;
            case RoundingMode.Unnecessary:
                Assert.interrupt("Got RoundingMode.Unnecessary while attempting to round.");
        }
    }

    // remove digits
    props.digits.length -= Math.min(removeDigitCount, props.digits.length);
    props.exponent += removeDigitCount;

    let i = props.digits.length - 1;

    while (roundUp) {
        if (i < 0) {
            props.digits.unshift(1);
            break;
        }
        props.digits[i] = props.digits[i] + 1;
        if (props.digits[i] === base) {
            props.digits[i] = 0;
            i--;
        }
        else {
            break;
        }
    }

    trimDigits(props);
}
