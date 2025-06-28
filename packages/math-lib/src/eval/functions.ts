import * as Eval from "eval";
import { initFunctionMap, fn_with_fixed_args, fn_with_min_args, fn_with_range_args } from "./functions-args";
import { Vocabulary } from "parser/vocabulary";
import { Assert, Utils } from "@tspro/ts-utils-lib";
import { BigNumber, IntegerDivisionMode, isBigNumber } from "bigmath";

const MaxSinCosRadians = 99999999;
const MinSinCosValue = 1e-20;

export const BuiltInFunctions = initFunctionMap([
    fn_with_fixed_args(Vocabulary.ans, 1, fnAns),
    fn_with_fixed_args(Vocabulary.frac, 2, fnFrac),
    fn_with_fixed_args(Vocabulary.abs, 1, fnAbs),
    fn_with_fixed_args(Vocabulary.sgn, 1, fnSgn),
    fn_with_fixed_args(Vocabulary.exp, 1, fnExp),
    fn_with_fixed_args(Vocabulary.sqrt, 1, fnSqrt),
    fn_with_fixed_args(Vocabulary.nthroot, 2, fnNthRoot),
    fn_with_range_args(Vocabulary.log, 1, 2, fnLog),
    fn_with_fixed_args(Vocabulary.ln, 1, fnLn),
    fn_with_fixed_args(Vocabulary.sin, 1, fnSin),
    fn_with_fixed_args(Vocabulary.cos, 1, fnCos),
    fn_with_fixed_args(Vocabulary.tan, 1, fnTan),
    fn_with_fixed_args(Vocabulary.asin, 1, fnArcSin),
    fn_with_fixed_args(Vocabulary.acos, 1, fnArcCos),
    fn_with_range_args(Vocabulary.atan, 1, 2, fnArcTan),
    fn_with_fixed_args(Vocabulary.sinh, 1, fnSinH),
    fn_with_fixed_args(Vocabulary.cosh, 1, fnCosH),
    fn_with_fixed_args(Vocabulary.tanh, 1, fnTanH),
    fn_with_fixed_args(Vocabulary.asinh, 1, fnArcSinH),
    fn_with_fixed_args(Vocabulary.acosh, 1, fnArcCosH),
    fn_with_fixed_args(Vocabulary.atanh, 1, fnArcTanH),
    fn_with_min_args(Vocabulary.gcd, 2, fnGCD),
    fn_with_min_args(Vocabulary.lcm, 2, fnLCM),
    fn_with_fixed_args(Vocabulary.permutation, 2, fnPermutation),
    fn_with_fixed_args(Vocabulary.combination, 2, fnCombination),
    fn_with_fixed_args(Vocabulary.transpose, 1, fnTranspose),
    fn_with_fixed_args(Vocabulary.det, 1, fnDet),
    fn_with_min_args(Vocabulary.min, 1, fnMin),
    fn_with_min_args(Vocabulary.max, 1, fnMax),
    fn_with_fixed_args(Vocabulary.clamp, 3, fnClamp),
    fn_with_range_args(Vocabulary.rnd, 1, 2, fnRandom),
    fn_with_range_args(Vocabulary.rndint, 1, 2, fnRandomInt),
    fn_with_range_args(Vocabulary.round, 1, 2, fnRound),
    fn_with_fixed_args(Vocabulary.floor, 1, fnFloor),
    fn_with_fixed_args(Vocabulary.ceil, 1, fnCeil),
    fn_with_fixed_args(Vocabulary.trunc, 1, fnTrunc),
]);

function simpleBigNumberFunc1(x: Eval.EvalValue, func: (x: BigNumber) => BigNumber, state: Eval.EvalState): Eval.EvalValue {
    if (state.syntaxCheck) {
        return Eval.SyntaxCheckValue;
    }
    else if (isBigNumber(x)) {
        try {
            return Eval.validateResult(func(x), state);
        }
        catch (err) { }
    }
    throw Eval.EvalError.MathError(state);
}

function simpleBigNumberFunc2(a: Eval.EvalValue, b: Eval.EvalValue, func: (a: BigNumber, b: BigNumber) => BigNumber, state: Eval.EvalState): Eval.EvalValue {
    if (state.syntaxCheck) {
        return Eval.SyntaxCheckValue;
    }
    else if (isBigNumber(a) && isBigNumber(b)) {
        try {
            return Eval.validateResult(func(a, b), state);
        }
        catch (err) { }
    }
    throw Eval.EvalError.MathError(state);
}

function validateSinCosAngle(rad: BigNumber, state: Eval.EvalState) {
    if (rad.abs().gt(MaxSinCosRadians, state.mc)) {
        throw Eval.EvalError.MathError(state);
    }
    return rad;
}

function validateSinCosResult(result: BigNumber, state: Eval.EvalState) {
    if (result.abs().lt(MinSinCosValue, state.mc)) {
        result = new BigNumber(result.isNegative() ? -0 : +0, state.mc);
    }
    return result;
}

export function fnAns(line: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    if (state.syntaxCheck) {
        return Eval.SyntaxCheckValue;
    }
    if (isBigNumber(line) && line.isInteger() && state.queryLineAns) {
        try {
            let ownAns = state.queryLineAns.queryLineAns(line.toNumber());
            if (ownAns) {
                return Eval.validateResult(ownAns, state);
            }
        }
        catch (e) { }
    }
    throw Eval.EvalError.MathError(state);
}

export function fnAdd(a: Eval.EvalValue, b: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    if (state.syntaxCheck) {
        return Eval.SyntaxCheckValue;
    }
    if (isBigNumber(a) && isBigNumber(b)) {
        return Eval.validateResult(a.add(b, mc), state);
    }
    else if (Eval.isMatrix(a) && Eval.isMatrix(b)) {
        if (a.nrows === b.nrows && a.ncols === b.ncols) {
            let m = new Eval.Matrix(a.nrows, a.ncols, (i, j) => fnAdd(a.cell(i, j), b.cell(i, j), state));
            return Eval.validateResult(m, state);
        }
    }
    throw Eval.EvalError.MathError(state);
}

export function fnSub(a: Eval.EvalValue, b: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    if (state.syntaxCheck) {
        return Eval.SyntaxCheckValue;
    }
    if (isBigNumber(a) && isBigNumber(b)) {
        return Eval.validateResult(a.sub(b, mc), state);
    }
    else if (Eval.isMatrix(a) && Eval.isMatrix(b)) {
        if (a.nrows === b.nrows && a.ncols === b.ncols) {
            let m = new Eval.Matrix(a.nrows, a.ncols, (i, j) => fnSub(a.cell(i, j), b.cell(i, j), state));
            return Eval.validateResult(m, state);
        }
    }
    throw Eval.EvalError.MathError(state);
}

export function fnMul(a: Eval.EvalValue, b: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    if (state.syntaxCheck) {
        return Eval.SyntaxCheckValue;
    }
    if (isBigNumber(a) && isBigNumber(b)) {
        return Eval.validateResult(a.mul(b, mc), state);
    }
    else if (isBigNumber(a) && Eval.isMatrix(b)) {
        return Eval.validateResult(b.map(cell => fnMul(a, cell, state)), state);
    }
    else if (Eval.isMatrix(a) && isBigNumber(b)) {
        return Eval.validateResult(a.map(cell => fnMul(b, cell, state)), state);
    }
    else if (Eval.isMatrix(a) && Eval.isMatrix(b)) {
        if ((a.nrows === 1 || a.ncols === 1) && (b.nrows === 1 || b.ncols === 1)) {
            // dot product
            if (a.nrows > 1) {
                a = a.transpose();
            }
            if (b.nrows > 1) {
                b = b.transpose();
            }
            Assert.assert(a.nrows === 1 && b.nrows === 1);

            if (a.ncols === b.ncols) {
                let sum = undefined;
                for (let i = 0; i < a.ncols; i++) {
                    let term = fnMul(a.cell(0, i), b.cell(0, i), state);
                    sum = sum === undefined ? term : sum = fnAdd(sum, term, state);
                }
                if (sum !== undefined) {
                    return Eval.validateResult(sum, state);
                }
            }
        }
    }
    throw Eval.EvalError.MathError(state);
}

export function fnDiv(a: Eval.EvalValue, b: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    if (state.syntaxCheck) {
        return Eval.SyntaxCheckValue;
    }
    if (isBigNumber(a) && isBigNumber(b)) {
        return Eval.validateResult(a.div(b, mc), state);
    }
    else if (Eval.isMatrix(a) && isBigNumber(b)) {
        return Eval.validateResult(a.map(cell => fnDiv(cell, b, state)), state);
    }
    throw Eval.EvalError.MathError(state);
}

export function fnMod(a: Eval.EvalValue, b: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    if (state.syntaxCheck) {
        return Eval.SyntaxCheckValue;
    }
    if (isBigNumber(a) && isBigNumber(b)) {
        return Eval.validateResult(a.mod(b, IntegerDivisionMode.Floor, mc), state); // Floor or Euclidean?
    }
    throw Eval.EvalError.MathError(state);
}

export function fnCrossProd(a: Eval.EvalValue, b: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    if (state.syntaxCheck) {
        return Eval.SyntaxCheckValue;
    }
    if (Eval.isMatrix(a) && Eval.isMatrix(b)) {
        // cross product
        if (a.ncols === b.nrows) {
            let m = new Eval.Matrix(a.nrows, b.ncols, (arow, bcol) => {
                let sum = undefined;
                for (let i = 0; i < a.ncols; i++) {
                    let term = fnMul(a.cell(arow, i), b.cell(i, bcol), state);
                    sum = sum === undefined ? term : fnAdd(sum, term, state);
                }
                return sum!;
            });
            return Eval.validateResult(m, state);
        }
    }
    throw Eval.EvalError.MathError(state);
}

export function fnTranspose(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    if (state.syntaxCheck) {
        return Eval.SyntaxCheckValue;
    }
    if (Eval.isMatrix(a)) {
        return Eval.validateResult(a.transpose(), state);
    }
    throw Eval.EvalError.MathError(state);
}

export function fnPow(a: Eval.EvalValue, exp: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    if (state.syntaxCheck) {
        return Eval.SyntaxCheckValue;
    }
    if (isBigNumber(a) && isBigNumber(exp)) {
        return Eval.validateResult(a.pow(exp, mc), state);
    }
    else if (Eval.isMatrix(a) && a.isSquare() && isBigNumber(exp)) {
        if (exp.isInteger()) {
            if (exp.lt(0, mc)) {
                return fnPow(fnInvert(a, state), exp.abs(), state);
            }
            else {
                let result: Eval.EvalValue = new Eval.Matrix(a.nrows, a.ncols, Eval.MatrixSetIdentity);
                let base: Eval.EvalValue = a;
                while (true) {
                    if (exp.isOdd()) {
                        result = fnCrossProd(result, base, state);
                    }
                    exp = exp.divToInt(2, IntegerDivisionMode.Trunc, mc);
                    if (exp.isZero()) {
                        break;
                    }
                    base = fnCrossProd(base, base, state);
                }
                return Eval.validateResult(result, state);
            }
        }
    }
    throw Eval.EvalError.MathError(state);
}

export function fnNegate(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    if (state.syntaxCheck) {
        return Eval.SyntaxCheckValue;
    }
    if (isBigNumber(a)) {
        return Eval.validateResult(a.neg(), state);
    }
    else if (Eval.isMatrix(a)) {
        return Eval.validateResult(a.map(cell => fnNegate(cell, state)), state);
    }
    throw Eval.EvalError.MathError(state);
}

export function fnSgn(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    return simpleBigNumberFunc1(a, x => new BigNumber(x.sgn(), mc), state);
}

export function fnFactorial(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    return simpleBigNumberFunc1(a, x => BigNumber.factorial(x, mc), state);
}

export function fnDoubleFactorial(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    return simpleBigNumberFunc1(a, x => BigNumber.doubleFactorial(x, mc), state);
}

export function fnFrac(a: Eval.EvalValue, b: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    return fnDiv(a, b, state);
}

export function fnAbs(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    return simpleBigNumberFunc1(a, x => x.abs(), state);
}

export function fnExp(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    return simpleBigNumberFunc1(a, x => x.exp(mc), state);
}

export function fnSqrt(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    return simpleBigNumberFunc1(a, x => x.sqrt(mc), state);
}

export function fnNthRoot(index: Eval.EvalValue, x: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    return simpleBigNumberFunc2(index, x, (index, x) => BigNumber.nthroot(index, x, mc), state);
}

export function fnLog(args: Eval.EvalValue[], state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    if (args.length === 1) {
        // log10(x)
        return simpleBigNumberFunc1(args[0], x => BigNumber.log(10, x, mc), state);
    }
    else if (args.length === 2) {
        // log(base, x)
        return simpleBigNumberFunc2(args[0], args[1], (base, x) => BigNumber.log(base, x, mc), state);
    }
    else {
        throw Eval.EvalError.MathError(state);
    }
}

export function fnLn(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    return simpleBigNumberFunc1(a, x => x.ln(mc), state);
}

export function fnSin(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    return simpleBigNumberFunc1(a, x => {
        x = validateSinCosAngle(x, state);
        let result = BigNumber.sin(x, mc);
        return validateSinCosResult(result, state);
    }, state);
}

export function fnCos(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    return simpleBigNumberFunc1(a, x => {
        x = validateSinCosAngle(x, state);
        let result = BigNumber.cos(x, mc);
        return validateSinCosResult(result, state);
    }, state);
}

export function fnTan(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    return fnDiv(fnSin(a, state), fnCos(a, state), state);
}

export function fnArcSin(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    return simpleBigNumberFunc1(a, x => BigNumber.asin(x, mc), state);
}

export function fnArcCos(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    return simpleBigNumberFunc1(a, x => BigNumber.acos(x, mc), state);
}

export function fnArcTan(args: Eval.EvalValue[], state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    if (args.length === 1) {
        return simpleBigNumberFunc1(args[0], y => BigNumber.atan(y, mc), state);
    }
    else if (args.length === 2) {
        return simpleBigNumberFunc2(args[0], args[1], (y, x) => BigNumber.atan2(y, x, mc), state);
    }
    else {
        throw Eval.EvalError.MathError(state);
    }
}

export function fnSinH(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    return simpleBigNumberFunc1(a, x => BigNumber.sinh(x, mc), state);
}

export function fnCosH(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    return simpleBigNumberFunc1(a, x => BigNumber.cosh(x, mc), state);
}

export function fnTanH(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    return simpleBigNumberFunc1(a, x => BigNumber.tanh(x, mc), state);
}

export function fnArcSinH(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    return simpleBigNumberFunc1(a, x => BigNumber.asinh(x, mc), state);
}

export function fnArcCosH(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    return simpleBigNumberFunc1(a, x => BigNumber.acosh(x, mc), state);
}

export function fnArcTanH(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    return simpleBigNumberFunc1(a, x => BigNumber.atanh(x, mc), state);
}

export function fnDet(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    if (state.syntaxCheck) {
        return Eval.SyntaxCheckValue;
    }
    if (Eval.isMatrix(a) && a.isSquare()) {
        // Calc determinant
        const det = (m: Eval.Matrix): Eval.EvalValue => {
            if (m.nrows === 1) {
                return m.cell(0, 0);
            }
            else if (m.nrows === 2) {
                let f1 = fnMul(m.cell(0, 0), m.cell(1, 1), state);
                let f2 = fnMul(m.cell(0, 1), m.cell(1, 0), state);
                return fnSub(f1, f2, state);
            }
            else {
                let sum = undefined;
                for (let j = 0; j < m.ncols; j++) {
                    let f = m.cell(0, j);
                    f = (j % 2 === 1) ? f = fnNegate(f, state) : f;
                    let subDet = det(m.removeRowAndColumn(0, j));
                    let term = fnMul(f, subDet, state);
                    sum = sum === undefined ? term : fnAdd(sum, term, state);
                }
                Assert.assert(sum != undefined, "Invalid sum.");
                return sum!;
            }
        }

        return det(a);
    }
    throw Eval.EvalError.MathError(state);
}

function fnCofactor(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    if (state.syntaxCheck) {
        return Eval.SyntaxCheckValue;
    }
    if (Eval.isMatrix(a) && a.isSquare()) {
        let m: Eval.Matrix;
        if (a.nrows === 1) {
            m = new Eval.Matrix(1, 1, Eval.MatrixSetIdentity);
        }
        else {
            m = new Eval.Matrix(a.nrows, a.ncols, (i, j) => {
                let k = fnDet(a.removeRowAndColumn(i, j), state);
                return (i + j) % 2 === 1 ? fnNegate(k, state) : k;
            });
        }
        return Eval.validateResult(m, state);
    }
    throw Eval.EvalError.MathError(state);
}

function fnAdjugate(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    if (state.syntaxCheck) {
        return Eval.SyntaxCheckValue;
    }
    return fnTranspose(fnCofactor(a, state), state);
}

export function fnInvert(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;

    if (state.syntaxCheck) {
        return Eval.SyntaxCheckValue;
    }
    if (Eval.isMatrix(a) && a.isSquare()) {
        let det = fnDet(a, state);
        if (isBigNumber(det)) {
            if (!det.eq(0, mc)) {
                let adj = fnAdjugate(a, state);
                return fnDiv(adj, det, state);
            }
        }
    }
    throw Eval.EvalError.MathError(state);
}

export function fnGCD(args: Eval.EvalValue[], state: Eval.EvalState): Eval.EvalValue {
    if (state.syntaxCheck) {
        return Eval.SyntaxCheckValue;
    }
    else if (args.length < 2) {
        throw Eval.EvalError.MathError(state);
    }

    let values: BigNumber[] = args.map(a => {
        if (isBigNumber(a) && a.isInteger()) {
            return a.abs();
        }
        else {
            throw Eval.EvalError.MathError(state);
        }
    });

    let { mc } = state;
    let result = values.shift()!;

    values.forEach(a => result = BigNumber.gcd(result, a, mc));

    return Eval.validateResult(result, state);
}

export function fnLCM(args: Eval.EvalValue[], state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;

    if (state.syntaxCheck) {
        return Eval.SyntaxCheckValue;
    }
    else if (args.length < 2) {
        throw Eval.EvalError.MathError(state);
    }

    let values: BigNumber[] = args.map(a => {
        if (isBigNumber(a) && a.isInteger() && !a.eq(0, mc)) {
            return a.abs();
        }
        else {
            throw Eval.EvalError.MathError(state);
        }
    });

    let result = values.shift()!;

    values.forEach(a => result = BigNumber.lcm(result, a, mc));

    return Eval.validateResult(result, state);
}

export function fnPermutation(n: Eval.EvalValue, r: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;

    return simpleBigNumberFunc2(n, r, (n, r) => {
        let a = n.factorial(mc);
        let b = n.sub(r, mc).factorial(mc);
        return a.div(b, mc);
    }, state);
}

export function fnCombination(n: Eval.EvalValue, r: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    return simpleBigNumberFunc2(n, r, (n, r) => {
        let a = n.factorial(mc);
        let b = n.sub(r, mc).factorial(mc).mul(r.factorial(mc), mc);
        return a.div(b, mc);
    }, state);
}

export function fnMin(args: Eval.EvalValue[], state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;

    if (state.syntaxCheck) {
        return Eval.SyntaxCheckValue;
    }

    if (args.length > 0 && args.every(n => isBigNumber(n))) {
        let values = args.map(n => n as BigNumber);
        let min = BigNumber.min(mc, ...values);
        return Eval.validateResult(min, state);
    }

    throw Eval.EvalError.MathError(state);
}

export function fnMax(args: Eval.EvalValue[], state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;

    if (state.syntaxCheck) {
        return Eval.SyntaxCheckValue;
    }

    if (args.length > 0 && args.every(n => isBigNumber(n))) {
        let values = args.map(n => n as BigNumber);
        let max = BigNumber.max(mc, ...values);
        return Eval.validateResult(max, state);
    }

    throw Eval.EvalError.MathError(state);
}

export function fnClamp(x: Eval.EvalValue, lo: Eval.EvalValue, hi: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;

    if (state.syntaxCheck) {
        return Eval.SyntaxCheckValue;
    }
    if (isBigNumber(x) && isBigNumber(lo) && isBigNumber(hi)) {
        if (lo.gt(hi, mc)) { let tmp = lo; lo = hi; hi = tmp; }
        return fnMax([fnMin([x, hi], state), lo], state);
    }
    throw Eval.EvalError.MathError(state);
}

export function fnRandom(args: Eval.EvalValue[], state: Eval.EvalState): Eval.EvalValue {
    if (state.syntaxCheck) {
        return Eval.SyntaxCheckValue;
    }

    if (!args.every(x => isBigNumber(x) && x.isFinite())) {
        throw Eval.EvalError.MathError(state);
    }

    let { mc } = state;
    let min, max;

    if (args.length === 1) {
        min = new BigNumber(0, mc);
        max = args[0] as BigNumber;
    }
    else if (args.length === 2) {
        min = args[0] as BigNumber;
        max = args[1] as BigNumber;
    }
    else {
        throw Eval.EvalError.MathError(state);
    }

    if (min.gt(max, mc)) {
        [min, max] = [max, min];
    }

    let range = max.sub(min, mc); // Decimal in range [min, max)

    let result = BigNumber.random(mc).mul(range, mc).add(min, mc);

    return Eval.validateResult(result, state);
}

export function fnRandomInt(args: Eval.EvalValue[], state: Eval.EvalState): Eval.EvalValue {
    if (state.syntaxCheck) {
        return Eval.SyntaxCheckValue;
    }

    if (!args.every(x => isBigNumber(x) && x.isInteger())) {
        throw Eval.EvalError.MathError(state);
    }

    let { mc } = state;
    let min, max;

    if (args.length === 1) {
        min = new BigNumber(0, mc);
        max = args[0] as BigNumber;
    }
    else if (args.length === 2) {
        min = args[0] as BigNumber;
        max = args[1] as BigNumber;
    }
    else {
        throw Eval.EvalError.MathError(state);
    }

    if (min.gt(max, mc)) {
        [min, max] = [max, min];
    }

    let range = max.sub(min, mc).add(1, mc); // Integer in range [min, max]

    let result = BigNumber.random(mc).mul(range, mc).add(min, mc).floor();

    return Eval.validateResult(result, state);
}

export function fnRound(args: Eval.EvalValue[], state: Eval.EvalState): Eval.EvalValue {
    if (state.syntaxCheck) {
        return Eval.SyntaxCheckValue;
    }
    let x = args[0];
    let dp = args[1];
    if (isBigNumber(x)) {
        if (dp) {
            if (isBigNumber(dp)) {
                let n = dp.toNumber();
                if (Utils.Math.isInteger(n) && n >= 0) {
                    return Eval.validateResult(x.round(n), state);
                }
            }
        }
        else {
            return Eval.validateResult(x.round(), state);
        }
    }
    throw Eval.EvalError.MathError(state);
}

export function fnFloor(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    return simpleBigNumberFunc1(a, x => x.floor(), state);
}

export function fnCeil(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    let { mc } = state;
    return simpleBigNumberFunc1(a, x => x.ceil(), state);
}

export function fnTrunc(a: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue {
    return simpleBigNumberFunc1(a, x => x.trunc(), state);
}
