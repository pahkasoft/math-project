import { BigNumber, IntegerDivisionMode } from "../bignumber";
import { MathContext } from "../mathcontext";
import { seriesIterator, SeriesProps } from "./series-iterator";
import { Assert } from "@tspro/ts-utils-lib";
import { halfEvenMc } from "./utils";

export namespace TrigonometricAlg {

    /*
        Content:
        sin
        cos
        tan -> sin, cos
        asin -> atan
        acos -> atan
        atan
        sinh -> exp
        cosh -> exp
        tanh -> exp
        asinh -> sqrt, ln
        acosh -> sqrt, ln
        atanh -> ln
    */

    const sin_props: SeriesProps = {
        name: "sin",
        safe_min_x: 0,
        safe_max_x: 6.3, // 2pi
        error_digits: 3,
        x_sub: 0,
        sign_0: 1,
        sign_mul: -1,
        exp_0: 1,
        exp_add: 2,
        div_0: 1,
        div_add: 2,
        div_isFactorial: true
    }

    const cos_props: SeriesProps = {
        name: "cos",
        safe_min_x: 0,
        safe_max_x: 6.3, // 2pi
        error_digits: 3,
        x_sub: 0,
        sign_0: 1,
        sign_mul: -1,
        exp_0: 0,
        exp_add: 2,
        div_0: 0,
        div_add: 2,
        div_isFactorial: true
    }

    /*
     * https://www.wolframalpha.com/input/?i=arctan+series
     */

    const atan1_props: SeriesProps = {
        name: "atan_1",
        safe_min_x: 0,
        safe_max_x: 0.9,
        error_digits: 1,
        x_sub: 0,
        sign_0: 1,
        sign_mul: -1,
        exp_0: 1,
        exp_add: 2,
        div_0: 1,
        div_add: 2,
        div_isFactorial: false
    }

    const atan2_props: SeriesProps = {
        name: "atan_2",
        safe_min_x: 1.1,
        safe_max_x: Infinity,
        error_digits: 1,
        x_sub: 0,
        sign_0: 1,
        sign_mul: -1,
        exp_0: -1,
        exp_add: -2,
        div_0: 1,
        div_add: 2,
        div_isFactorial: false
    }

    function pow2(x: BigNumber, mc: MathContext) {
        return x.mul(x, mc);
    }

    function mod2pi(x: BigNumber, mc: MathContext) {
        let two_pi = BigNumber.two_pi;

        let mod_precision = mc.precision + Math.max(0, x.digitCount + x.exponent);
        Assert.assert(mod_precision <= two_pi.mc.precision, "Not enough precision in constant two_pi.");

        let mod_mc = new MathContext(mc.base, mod_precision, mc.roundingMode);

        return x.mod(two_pi, IntegerDivisionMode.Euclidean, mod_mc).convert(mc);
    }

    export function sin(x: BigNumber, mcArg: MathContext) {
        Assert.assert(x.mc.equals(mcArg));

        if (x.isNaN() || x.isAbsInfinity()) {
            return new BigNumber(NaN, mcArg);
        }
        else if (x.isZero()) {
            return x; // Correct sign +0 or -0
        }

        let mc = halfEvenMc(mcArg);

        let result = seriesIterator(sin_props, mod2pi(x, mc), mc);

        return result.convert(mcArg);
    }

    export function cos(x: BigNumber, mcArg: MathContext) {
        Assert.assert(x.mc.equals(mcArg));

        if (x.isNaN() || x.isAbsInfinity()) {
            return new BigNumber(NaN, mcArg);
        }

        let mc = halfEvenMc(mcArg);

        let result = seriesIterator(cos_props, mod2pi(x, mc), mc);

        return result.convert(mcArg);
    }

    export function tan(x: BigNumber, mcArg: MathContext): BigNumber {
        let mc = halfEvenMc(mcArg);
        x = x.convert(mc);
        let result = sin(x, mc).div(cos(x, mc), mc);
        return result.convert(mcArg);
    }

    export function asin(x: BigNumber, mcArg: MathContext): BigNumber {
        Assert.assert(x.mc.equals(mcArg));

        if (x.isNaN() || x.abs().gt(1, mcArg)) {
            return new BigNumber(NaN, mcArg);
        }
        else if (x.isNegative()) {
            // Correct sign +0 or -0
            return asin(x.neg(), mcArg).neg();
        }
        else {
            let mc = halfEvenMc(mcArg);
            x = x.convert(mc);
            let result = atan(x.div(new BigNumber(1, mc).sub(pow2(x, mc), mc).sqrt(mc), mc), mc);
            return result.convert(mcArg);
        }
    }

    export function acos(x: BigNumber, mcArg: MathContext): BigNumber {
        Assert.assert(x.mc.equals(mcArg));

        if (x.isNaN() || x.abs().gt(1, mcArg)) {
            return new BigNumber(NaN, mcArg);
        }
        else {
            let mc = halfEvenMc(mcArg);
            x = x.convert(mc);
            let result = BigNumber.pi_div2.sub(asin(x, mc), mc);
            return result.convert(mcArg);
        }
    }

    export function atan(x: BigNumber, mcArg: MathContext): BigNumber {
        Assert.assert(x.mc.equals(mcArg));

        let mc = halfEvenMc(mcArg);

        x = x.convert(mc);

        let result: BigNumber;

        if (x.isNaN()) {
            result = new BigNumber(NaN, mcArg);
        }
        else if (x.isAbsInfinity()) {
            result = BigNumber.pi_div2.mulSign(x.sign).convert(mcArg);
        }
        else if (x.isNegative()) {
            // Correct sign -0 or +0
            result = atan(x.neg(), mc).neg();
        }
        else if (x.gt(0.8, mc) && x.lt(1.2, mc)) {
            // Values close to 1 take too many iterations.
            // Use: arctan(x) = arctan((x + b) / (1 - x * b)) - arctan(b)
            let b = new BigNumber(0.5, mc); // A choice
            let c = x.add(b, mc).div(new BigNumber(1, mc).sub(x.mul(b, mc), mc), mc);
            result = atan(c, mc).sub(atan(b, mc), mc);
        }
        else if (x.lt(1, mc)) {
            result = seriesIterator(atan1_props, x, mc);
        }
        else { // x.gt(1)
            let r = seriesIterator(atan2_props, x, mc);
            result = BigNumber.pi_div2.sub(r, mc);
        }

        return result.convert(mcArg);
    }

    export function atan2(y: BigNumber, x: BigNumber, mc: MathContext): BigNumber {
        Assert.assert(y.mc.equals(mc));
        Assert.assert(x.mc.equals(mc));

        // https://en.wikipedia.org/wiki/Atan2
        if (x.gt(0, mc)) { return atan(y.div(x, mc), mc); }
        else if (x.lt(0, mc) && y.gte(0, mc)) { return atan(y.div(x, mc), mc).add(BigNumber.pi, mc); }
        else if (x.lt(0, mc) && y.lt(0, mc)) { return atan(y.div(x, mc), mc).sub(BigNumber.pi, mc); }
        else if (x.eq(0, mc) && y.gt(0, mc)) { return BigNumber.pi_div2.convert(mc); }
        else if (x.eq(0, mc) && y.lt(0, mc)) { return BigNumber.pi_div2.convert(mc).neg(); }
        else { return new BigNumber(NaN, mc); }
    }

    export function sinh(x: BigNumber, mcArg: MathContext): BigNumber {
        Assert.assert(x.mc.equals(mcArg));

        if (x.isZero()) {
            return x; // Correxct sign -0 or +0
        }
        else {
            let mc = halfEvenMc(mcArg);
            let result = x.exp(mc).sub(x.neg().exp(mc), mc).div(2, mc);
            return result.convert(mcArg);
        }
    }

    export function cosh(x: BigNumber, mcArg: MathContext): BigNumber {
        Assert.assert(x.mc.equals(mcArg));

        let mc = halfEvenMc(mcArg);
        let result = x.exp(mc).add(x.neg().exp(mc), mc).div(2, mc);
        return result.convert(mcArg);
    }

    export function tanh(x: BigNumber, mcArg: MathContext): BigNumber {
        Assert.assert(x.mc.equals(mcArg));

        if (x.isZero()) {
            return x; // Correxct sign -0 or +0
        }
        else if (x.isAbsInfinity()) {
            return new BigNumber(1, mcArg).mulSign(x.sign);
        }
        else {
            let mc = halfEvenMc(mcArg);
            let result = (x.exp(mc).sub(x.neg().exp(mc), mc)).div(x.exp(mc).add(x.neg().exp(mc), mc), mc);
            return result.convert(mcArg);
        }
    }

    export function asinh(x: BigNumber, mcArg: MathContext): BigNumber {
        Assert.assert(x.mc.equals(mcArg));

        if (x.isZero() || x.isAbsInfinity()) {
            // x = 0: correct sign -0 or +0
            // x = inf: ln(x+sqrt(x^2+1)) = +-inf
            return x;
        }
        else if (x.isNegative()) {
            // Can be calculated with negative x, but has better accuracy with positive values.
            return asinh(x.neg(), mcArg).neg();
        }
        else {
            let mc = halfEvenMc(mcArg);
            let result = x.add(pow2(x, mc).add(1, mc).sqrt(mc), mc).ln(mc);
            return result.convert(mcArg);
        }
    }

    export function acosh(x: BigNumber, mcArg: MathContext): BigNumber {
        Assert.assert(x.mc.equals(mcArg));

        let mc = halfEvenMc(mcArg);
        let result = x.add(pow2(x, mc).sub(1, mc).sqrt(mc), mc).ln(mc);
        return result.convert(mcArg);
    }

    export function atanh(x: BigNumber, mcArg: MathContext): BigNumber {
        Assert.assert(x.mc.equals(mcArg));

        if (x.isZero()) {
            return x; // Correxct sign -0 or +0
        }
        else if (x.isAbsOne()) {
            return new BigNumber(Infinity * x.sign, mcArg);
        }
        else {
            let mc = halfEvenMc(mcArg);
            let result = (x.add(1, mc).div(x.sub(1, mc).neg(), mc)).ln(mc).div(2, mc);
            return result.convert(mcArg);
        }
    }

}
