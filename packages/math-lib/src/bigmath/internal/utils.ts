import { MathContext, RoundingMode } from "../mathcontext";

export function eqDigits(a: number[], b: number[]) {
    if (a === b) return true;
    if (a.length !== b.length) return false;
    for (let i = 0, n = a.length; i < n; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

export function halfEvenMc(mc: MathContext, addPrecision: number = 0) {
    if(mc.roundingMode === RoundingMode.HalfEven && addPrecision === 0) {
        return mc;
    }
    else {
        return new MathContext(mc.base, mc.precision + addPrecision, RoundingMode.HalfEven);
    }
}
