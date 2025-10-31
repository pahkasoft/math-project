import { BigNumber, IntegerDivisionMode } from "../bignumber";
import { MathContext, RoundingMode } from "../mathcontext";
import { Assert } from "@tspro/ts-utils-lib";
import { Helpers } from "../helpers";
import { eqDigits } from "./utils";

export namespace BasicAlg {

    const AddExtraDigits = 1;
    const DivExtraDigits = 1;

    export function cmp(a: BigNumber, b: BigNumber, mc: MathContext) {
        Assert.assert(a.mc.equals(mc));
        Assert.assert(b.mc.equals(mc));

        if (a.isNaN() || b.isNaN()) { return undefined; }
        else if (a.isAbsInfinity() && b.isAbsInfinity()) { return a.sign === b.sign ? 0 : a.sign; }
        else if (a.isAbsInfinity()) { return a.sign; }
        else if (b.isAbsInfinity()) { return -b.sign; }
        else if (a.isZero()) { return b.isZero() ? 0 : -b.sign; }
        else if (b.isZero()) { return a.sign; }
        else if (a.sign !== b.sign) { return a.sign; }

        let a_digits = Assert.require(a.digits);
        let b_digits = Assert.require(b.digits);

        if (a.exponent === b.exponent && eqDigits(a_digits, b_digits)) { return 0; }

        let sign = a.sign; // a.sign = b.sign
        let int_n = a_digits.length + a.exponent;
        let b_int_n = b_digits.length + b.exponent;
        if (int_n !== b_int_n) { return int_n < b_int_n ? -sign : sign; }

        let a_frac_n = -a.exponent;
        let b_frac_n = -b.exponent;
        let frac_n = Math.max(a_frac_n, b_frac_n);
        let ai = int_n - int_n;
        let bi = b_int_n - int_n;
        let i = int_n + frac_n;

        while (--i >= 0) {
            let ax = a_digits[ai++], bx = b_digits[bi++];
            if (ax === undefined || ax < bx) { return -sign; }
            else if (bx === undefined || ax > bx) { return sign; }
        }

        return 0;
    }

    function areOpposites(a: BigNumber, b: BigNumber) {
        Assert.assert(a.mc.base === b.mc.base);
        return a.sign === -b.sign && a.exponent === b.exponent && a.digits && b.digits && eqDigits(a.digits, b.digits);
    }

    export function add(a: BigNumber, b: BigNumber, mc: MathContext) {
        Assert.assert(a.mc.equals(mc));
        Assert.assert(b.mc.equals(mc));

        if (a.isNaN() || b.isNaN()) { return new BigNumber(NaN, mc); }
        else if (a.isAbsInfinity() && b.isFinite()) { return a; }
        else if (a.isFinite() && b.isAbsInfinity()) { return b; }
        else if (a.isAbsInfinity() && b.isAbsInfinity()) { return a.sign === b.sign ? a : new BigNumber(NaN, mc); }
        else if (areOpposites(a, b)) { return new BigNumber(Helpers.signedZero(a.sign), mc); } // Opposite values => Zero with sign from a
        else if (a.isZero()) { return b; }
        else if (b.isZero()) { return a; }

        let op = 1;
        let sgn = 1;

        // Make a.abs() > b.abs()
        if (a.abs().lt(b.abs(), mc)) { let tmp = a; a = b; b = tmp; }
        // Both neg => both pos
        if (a.isNegative() && b.isNegative()) { a = a.neg(), b = b.neg(), sgn = -sgn; }
        // Make a > 0
        if (a.isNegative()) { a = a.neg(), b = b.neg(), sgn = -sgn; }
        // Make b > 0
        if (b.isNegative()) { b = b.neg(), op = -op; }


        let ad = Assert.require(a.digits);
        let bd = Assert.require(b.digits);
        let a_int_n = ad.length + a.exponent;
        let b_int_n = bd.length + b.exponent;
        let a_frac_n = -a.exponent;
        let b_frac_n = -b.exponent;
        let int_n = Math.max(a_int_n, b_int_n);
        let frac_n = Math.max(a_frac_n, b_frac_n);

        let i = int_n + frac_n;
        let ai = ad.length - 1 + frac_n - a_frac_n;
        let bi = bd.length - 1 + frac_n - b_frac_n;

        let evalPrecision = mc.precision + AddExtraDigits;

        let ignore_n = Math.max(i - evalPrecision, 0);

        i -= ignore_n;
        ai -= ignore_n;
        bi -= ignore_n;
        frac_n -= ignore_n;

        let digits: number[] = new Array(i);
        let overflow = 0;

        while (--i >= 0) {
            let ax = (ad[ai--] ?? 0) + overflow;
            let bx = bd[bi--] ?? 0;
            overflow = 0;
            let cx = ax + op * bx;
            if (cx >= mc.base) { cx -= mc.base; overflow = 1; }
            else if (cx < 0) { cx += mc.base; overflow = -1; }
            digits[i] = cx;
        }

        Assert.assert(overflow === 0 || overflow === 1);

        if (overflow === 1) {
            digits.unshift(1);
        }

        return new BigNumber(sgn, digits, -frac_n, mc);
    }

    export function mul(a: BigNumber, b: BigNumber, mc: MathContext) {
        Assert.assert(a.mc.equals(mc));
        Assert.assert(b.mc.equals(mc));

        if (a.isNaN() || b.isNaN()) { return new BigNumber(NaN, mc); }
        else if (a.isAbsInfinity() && b.isZero() || a.isZero() && b.isAbsInfinity()) { return new BigNumber(NaN, mc); }
        else if (a.isAbsInfinity() || b.isAbsInfinity()) { return new BigNumber(Infinity * a.sign * b.sign, mc); }
        else if (a.isZero() || b.isZero()) { return new BigNumber(Helpers.signedZero(a.sign * b.sign), mc); }
        else if (a.isAbsOne()) { return b.mulSign(a.sign); }
        else if (b.isAbsOne()) { return a.mulSign(b.sign); }

        // mul_alg
        let ad = Assert.require(a.digits).slice().reverse();
        let bd = Assert.require(b.digits).slice().reverse();
        let digits: number[] = [];

        for (let bi = 0; bi < bd.length; bi++) {
            for (let ai = 0; ai < ad.length; ai++) {
                let x = ad[ai] * bd[bi];
                let i = bi + ai;
                do {
                    let d = (digits[i] ?? 0) + x;
                    digits[i] = d % mc.base;
                    x = Math.trunc(d / mc.base);
                    i++;
                } while (x > 0);
            }
        }

        digits.reverse();

        return new BigNumber(a.sign * b.sign, digits, a.exponent + b.exponent, mc);
    }

    function bareInt(x: BigNumber, mc: MathContext) {
        Assert.assert(x.mc.base === mc.base);
        return new BigNumber(1, x.digits, 0, mc);
    }

    function getDigit(x: BigNumber, i: number) {
        return new BigNumber(1, [x.digits![i] || 0], 0, x.mc);
    }

    function divideUInt(N: BigNumber, D: BigNumber, mc: MathContext): { Q: BigNumber, R: BigNumber } {
        if (N.isZero()) {
            return { Q: N, R: N }
        }
        else if (D.isAbsOne()) {
            return { Q: N, R: new BigNumber(0, mc) }
        }
        else {
            const _1 = new BigNumber(1, mc);
            let Q = new BigNumber(0, mc);
            let R = N;
            while (R.gte(D, mc)) {
                Q = Q.add(_1, mc);
                R = R.sub(D, mc);
            }
            return { Q, R }
        }
    }

    export function div(a: BigNumber, b: BigNumber, divMode: IntegerDivisionMode | undefined, mc: MathContext): { Q: BigNumber, R?: BigNumber } {
        Assert.assert(a.mc.equals(mc));
        Assert.assert(b.mc.equals(mc));

        let sign = a.sign * b.sign;

        let Q: BigNumber;
        let QIsTruncated: boolean;

        if (a.isNaN() || b.isNaN() || a.isZero() && b.isZero() || a.isAbsInfinity() && b.isAbsInfinity()) {
            Q = new BigNumber(NaN, mc);
            QIsTruncated = false;
        }
        else if (a.isAbsInfinity() || b.isZero()) {
            Q = new BigNumber(Infinity, mc).mulSign(sign);
            QIsTruncated = false;
        }
        else if (b.isAbsInfinity() || a.isZero()) {
            Q = new BigNumber(Helpers.signedZero(sign), mc);
            QIsTruncated = false;
        }
        else {
            let divToInt = divMode !== undefined;
            let shiftExp = a.exponent + a.digitCount - b.exponent;
            let Aindex = 0;

            let divMC = new MathContext(mc.base, mc.precision + DivExtraDigits, RoundingMode.HalfEven);

            let A = bareInt(a, divMC);
            let B = bareInt(b, divMC);

            let rem = new BigNumber(0, divMC);
            let remHistory: BigNumber[] = [];

            let result = new BigNumber(0, divMC);

            while (result.digitCount + result.trailingZeroCount < divMC.precision) {
                if (divToInt && shiftExp <= 0) {
                    break;
                }
                else if (Aindex >= A.digitCount) {
                    if (rem.isZero()) {
                        break;
                    }
                    else if (divMC.precision === Infinity) {
                        if (remHistory.some(prev => rem.eq(prev, divMC))) {
                            Assert.fail("Endless repeating division.");
                        }
                        else {
                            remHistory.push(rem);
                        }
                    }
                }

                let x = rem.shiftExponent(1).add(getDigit(A, Aindex), divMC);
                let { Q, R } = divideUInt(x, B, divMC);

                result = result.shiftExponent(1).add(Q, divMC);
                rem = R;

                Aindex++;
                shiftExp--;
            }

            Q = result.shiftExponent(shiftExp).mulSign(sign);
            QIsTruncated = !rem.isZero() || Aindex < A.digitCount;
        }

        Q = Q.convert(mc);

        if (divMode === undefined) {
            return { Q, R: undefined }
        }
        else if (divMode === IntegerDivisionMode.Trunc) {
            let R = a.sub(b.mul(Q, mc), mc);
            return { Q, R }
        }
        else if (divMode === IntegerDivisionMode.Floor) {
            Q = QIsTruncated && sign < 0 ? Q.sub(1, mc) : Q;
            let R = a.sub(b.mul(Q, mc), mc);
            return { Q, R }
        }
        else if (divMode === IntegerDivisionMode.Euclidean) {
            if (b.gt(0, mc)) {
                Q = QIsTruncated && sign < 0 ? Q.sub(1, mc) : Q;
            }
            else if (b.lt(0, mc)) {
                Q = QIsTruncated && sign > 0 ? Q.add(1, mc) : Q;
            }
            let R = a.sub(b.mul(Q, mc).abs().mulSign(a.sign), mc);
            return { Q, R }
        }
        else {
            Assert.fail("Invalid divMode");
        }
    }

}
