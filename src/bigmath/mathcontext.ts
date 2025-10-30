import { Assert } from "@tspro/ts-utils-lib";
import { Helpers } from "./helpers";

/**
 * Rounding mode
 */
export enum RoundingMode {
    /** Round towards positive infinity. */
    Ceil,
    /** Round toward zero. */
    Down,
    /** Round towards negative infinity. */
    Floor,
    /** Round towards nearest neighbor. If two neighbors are equidistant, then down. */
    HalfDown,
    /** Round towards nearest neighbor. If two neighbors are equidistant, then toward even neighbor. */
    HalfEven,
    /** Round towards nearest neighbor. If two neighbors are equidistant, then up. */
    HalfUp,
    /** Rounding is not expected. Throws error if rounding occurs.  */
    Unnecessary,
    /** Round away from zero. */
    Up
}

function validateRoundingMode(rm: unknown): RoundingMode {
    Assert.assert(typeof rm === 'number' && RoundingMode[rm] !== undefined, "Invalid rounding mode: " + rm);
    return rm as RoundingMode;
}

/**
 * Most math operations require math context.
 */
export class MathContext {
    /**
     * If sci exponent > MaxExponent then value is Infinity.
     */
    public static MaxExponent = 999999;

    /**
     * If sci exponent < MinExponent then value is 0.
     */
    public static MinExponent = -999999;

    public readonly base: number;
    public readonly precision: number;
    public readonly roundingMode: RoundingMode;

    /**
     * Create new math context.
     * @param base Integer between 2 and [[BigNumber.MaxBase]].
     * @param precision Positive integer or Infinity?
     * @param rm Rounding mode.
     */
    constructor(base: number, precision: number, rm: RoundingMode) {
        this.base = Helpers.validateBase(base);
        this.precision = Helpers.validatePrecision(precision);
        this.roundingMode = validateRoundingMode(rm);
    }

    equals(other: MathContext) {
        return this === other || (this.base === other.base && this.precision === other.precision && this.roundingMode === other.roundingMode);
    }
}
