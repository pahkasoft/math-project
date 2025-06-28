import { Assert } from "@tspro/ts-utils-lib";
import { BigNumber } from "../bignumber"
import { MathContext, RoundingMode } from "../mathcontext"

const MaxSteps = 2500;

function biggerAbsValue(a: BigNumber, b: BigNumber, mc: MathContext) {
    a = a.abs();
    b = b.abs();
    return a.gt(b, mc) ? a : b;
}

export interface SeriesProps {
    name: string;
    safe_min_x: number;
    safe_max_x: number;
    error_digits: number;
    x_sub: number;
    sign_0: number; // 1 | -1;
    sign_mul: number; // 1 | -1;
    exp_0: number;
    exp_add: number;
    div_0: number;
    div_add: number;
    div_isFactorial: boolean;
}

export function seriesIterator(props: SeriesProps, x: BigNumber, mcArg: MathContext, errorDigits?: number): BigNumber {
    if (x.lt(props.safe_min_x, mcArg) || x.gt(props.safe_max_x, mcArg)) {
        console.info("Series iterator: " + props.name + "(" + x.toString() + ") exceeded safe limits.");
    }

    errorDigits = errorDigits ?? props.error_digits;

    let mc = new MathContext(mcArg.base, mcArg.precision + errorDigits, RoundingMode.HalfEven);

    let result = new BigNumber(0, mc),
        prev: BigNumber,
        biggestTerm = new BigNumber(0, mc),
        steps = 0,
        sign = props.sign_0,
        _x = x.sub(props.x_sub, mc),
        X = _x.pow(props.exp_0, mc),
        X_mul = _x.pow(props.exp_add, mc),
        div_n = new BigNumber(props.div_0, mc),
        div = props.div_isFactorial ? div_n.factorial(mc) : div_n;

    while (true) {
        prev = result;

        let term = X.div(div, mc).mulSign(sign);

        biggestTerm = biggerAbsValue(biggestTerm, term, mc);

        result = result.add(term, mc);

        if (++steps > MaxSteps) {
            Assert.interrupt("Series iterator: " + props.name + "(" + x.toString() + ") reached max steps " + MaxSteps + ".");
        }
        else if (prev.eq(result, mc)) {
            break;
        }

        sign *= props.sign_mul;

        X = X.mul(X_mul, mc);

        if (props.div_isFactorial) {
            for (let i = 0; i < props.div_add; i++) {
                div_n = div_n.add(1, mc);
                div = div.mul(div_n, mc);
            }
        }
        else {
            div_n = div_n.add(props.div_add, mc);
            div = div_n;
        }
    }

    let resultErrorDigits = Math.max(0, biggestTerm.sciExponent - result.sciExponent);

    if (Number.isFinite(resultErrorDigits) && resultErrorDigits > errorDigits) {
        console.info("Series iterator: " + props.name + "(" + x.toString() + "), recalc with " + resultErrorDigits + " error digits.");
        return seriesIterator(props, x, mcArg, resultErrorDigits);
    }
    else {
        return result.convert(mcArg);
    }
}
