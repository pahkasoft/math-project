import { BigNumber, IntegerDivisionMode } from "../bignumber";
import { MathContext } from "../mathcontext";
import { seriesIterator, SeriesProps } from "./series-iterator";
import { Assert } from "@tspro/ts-utils-lib";
import { halfEvenMc } from "./utils";

export namespace AdvancedAlg {

    /*
        Content:
        exp
        pow -> exp
        ln
        log -> ln
        sqrt
        nthroot -> pow -> exp
        factorial
        gcd
    */

    const goodSciExp = (e: BigNumber) => { let n = e.sciExponent; return Number.isFinite(n) ? Math.max(n, 0) : 0; }

    function createPowerMc(parent: MathContext, exp: BigNumber) {
        return halfEvenMc(parent, goodSciExp(exp));
    }


    const exp_props: SeriesProps = {
        name: "exp",
        safe_min_x: 0,
        safe_max_x: 1,
        error_digits: 0,
        x_sub: 0,
        sign_0: 1,
        sign_mul: 1,
        exp_0: 0,
        exp_add: 1,
        div_0: 0,
        div_add: 1,
        div_isFactorial: true
    }

    const ln_props: SeriesProps = {
        name: "ln",
        safe_min_x: 0.1,
        safe_max_x: 1.9,
        error_digits: 0,
        x_sub: 1,
        sign_0: 1,
        sign_mul: -1,
        exp_0: 1,
        exp_add: 1,
        div_0: 1,
        div_add: 1,
        div_isFactorial: false
    }

    export function exp(x: BigNumber, mcArg: MathContext): BigNumber {
        Assert.assert(x.mc.equals(mcArg));

        let mc = createPowerMc(mcArg, x);

        let invert = x.isNegative();
        if (invert) {
            x = x.neg();
        }

        // Now x >= +0

        let result: BigNumber;

        if (x.isNaN()) {
            result = new BigNumber(NaN, mc);
        }
        else if (x.isAbsInfinity()) {
            result = new BigNumber(Infinity, mc);
        }
        else if (x.isZero()) {
            result = new BigNumber(1, mc);
        }
        else {
            //let { Q, R } = x.divideAndRemainder(1, IntegerDivisionMode.Floor, mc);
            let Q = x.floor(), R = x.sub(Q, mc);

            let a = BigNumber.e.pow(Q, mc); // e^Q pow int
            let b = seriesIterator(exp_props, R, mc); // pow e^R, R = [0..1)

            result = a.mul(b, mc);
        }

        if (invert) {
            result = result.reciproc(mc);
        }

        return result.convert(mcArg);
    }

    export function pow(x: BigNumber, exp: BigNumber, mcArg: MathContext): BigNumber {
        Assert.assert(x.mc.equals(mcArg));
        Assert.assert(exp.mc.equals(mcArg));

        let mc = createPowerMc(mcArg, exp);

        let result: BigNumber;

        let invert = exp.isNegative();
        if (invert) {
            exp = exp.neg();
        }

        if (x.isNaN() || exp.isNaN()) {
            result = new BigNumber(NaN, mc);
        }
        else if (exp.isAbsInfinity()) {
            if (x.isNegative()) {
                result = new BigNumber(NaN, mc);
            }
            else if (x.lt(1, mc)) {
                result = new BigNumber(0, mc);
            }
            else if (x.eq(1, mc)) {
                result = x;
            }
            else {
                result = new BigNumber(Infinity, mc);
            }
        }
        else if (exp.isZero()) {
            result = new BigNumber(1, mc);
        }
        else if (exp.isInteger()) {
            result = new BigNumber(1, mc);
            while (true) {
                if (exp.isOdd()) {
                    result = result.mul(x, mc);
                }
                exp = exp.divToInt(2, IntegerDivisionMode.Trunc, mc);
                if (exp.isZero()) {
                    break;
                }
                x = x.mul(x, mc);
            }
        }
        else {
            if (x.isNegative()) {
                result = new BigNumber(NaN, mc);
            }
            else {
                // result = e^(ln(x)*exp)

                result = x.ln(mc).mul(exp, mc).exp(mc);
                /*
                if (result.gt(0.0006, mc) && result.lt(0.0007, mc)) {
                    console.log(result.toString(), "precision = " + mc.precision);
                }
                */
            }
        }

        if (invert) {
            result = result.reciproc(mc);
        }

        return result.convert(mcArg);
    }

    export function ln(x: BigNumber, mcArg: MathContext): BigNumber {
        Assert.assert(x.mc.equals(mcArg));

        if (x.isNaN() || x.isNegative() && !x.isZero()) {
            return new BigNumber(NaN, mcArg);
        }
        else if (x.isZero()) {
            return new BigNumber(-Infinity, mcArg);
        }
        else if (x.isAbsOne()) {
            return new BigNumber(0, mcArg);
        }
        else if (x.isAbsInfinity()) {
            return new BigNumber(Infinity, mcArg);
        }
        else {
            let mc = halfEvenMc(mcArg);

            let result: BigNumber;

            const _ln = (x: BigNumber) => {
                // x = 1.000 ... 9.999 (scientific notation)
                // ln(x) = ln(x/2) + ln(2)
                let a = new BigNumber(0, mc);
                while (x.gt(1.333, mc)) {
                    x = x.div(2, mc);
                    a = a.add(BigNumber.ln2, mc);
                }
                // x = 0.666 ... 1.333
                return seriesIterator(ln_props, x, mc).add(a, mc);
            }

            // x = a * 10^b
            // ln(x) = ln(a) + b * ln(10)
            let a = new BigNumber(x.sign, x.digits, x.exponent - x.sciExponent, x.mc);
            let b = x.sciExponent;
            let _10 = new BigNumber("10", mc);
            result = _ln(a).add(_ln(_10).mul(b, mc), mc);
            //result = _ln(x);

            /*
            console.log("a = " + a.toPlainString());
            console.log("ln(a) = " + _ln(a).toPlainString());
            */

            return result.convert(mcArg);
        }
    }

    export function log(base: BigNumber, x: BigNumber, mcArg: MathContext): BigNumber {
        let mc = halfEvenMc(mcArg);
        x = x.convert(mc);
        base = base.convert(mc);
        let result = ln(x, mc).div(ln(base, mc), mc);
        return result.convert(mcArg);
    }

    export function sqrt(x: BigNumber, mcArg: MathContext): BigNumber {
        Assert.assert(x.mc.equals(mcArg));

        if (x.isZero()) {
            // 0 or -0 => 0
            return new BigNumber(0, mcArg);
        }
        else if (x.isNegative() || x.isNaN()) {
            return new BigNumber(NaN, mcArg);
        }
        else if (x.isAbsOne() || x.isAbsInfinity()) {
            return x;
        }
        else {
            let mc = halfEvenMc(mcArg),
                mc1 = halfEvenMc(mcArg, 1);

            let prev, result = x.div(2, mc1);

            do {
                prev = result;
                result = prev.add(x.div(prev, mc1), mc1).div(2, mc1);
            } while (!result.eq(prev, mc));

            return result.convert(mcArg);
        }

    }

    export function nthroot(index: BigNumber, x: BigNumber, mcArg: MathContext): BigNumber {
        Assert.assert(index.mc.equals(mcArg));
        Assert.assert(x.mc.equals(mcArg));

        if (x.isNegative() && index.isOdd()) {
            return nthroot(index, x.neg(), mcArg).neg();
        }
        else {
            let mc = halfEvenMc(mcArg);
            let result = x.pow(index.reciproc(mc), mc);
            return result.convert(mcArg);
        }
    }

    export function factorial(x: BigNumber, p: number, mcArg: MathContext): BigNumber {
        Assert.assert(x.mc.equals(mcArg));
        Assert.assert(p === 1 || p === 2);

        if (x.isInteger() && x.isPositive() || x.isZero()) {
            let mc = createPowerMc(mcArg, x);

            let sub = new BigNumber(p, mc);
            let result = new BigNumber(1, mc);
            for (x = x.convert(mc); x.gte(2, mc) && !result.isAbsInfinity(); x = x.sub(sub, mc)) {
                result = result.mul(x, mc);
            }

            return result.convert(mcArg);
        }
        else if (x.isAbsInfinity() && x.isPositive()) {
            return x;
        }
        else {
            return new BigNumber(NaN, mcArg);
        }
    }

    export function gcd(a: BigNumber, b: BigNumber, mc: MathContext): BigNumber {
        Assert.assert(a.isPositive() && a.isInteger() && a.mc.equals(mc));
        Assert.assert(b.isPositive() && b.isInteger() && b.mc.equals(mc));

        if (b.gt(a, mc)) {
            return gcd(b, a, mc);
        }
        else if (b.isZero()) {
            return a;
        }
        else {
            return gcd(b, a.mod(b, IntegerDivisionMode.Trunc, mc), mc);
        }
    }

}