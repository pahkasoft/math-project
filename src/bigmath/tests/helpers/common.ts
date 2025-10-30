import { MathContext, RoundingMode } from "../..";

export function MC(base: number, precision: number, roundingMode?: RoundingMode) {
    return new MathContext(base, precision, roundingMode ?? RoundingMode.HalfUp);
}

export const real_mc = MC(10, 50);
export const real_eq_mc = MC(10, 47);
