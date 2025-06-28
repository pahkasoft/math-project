import * as Eval from "eval";
import { Assert } from "@tspro/ts-utils-lib";
import { BigNumber, isBigNumber, MathContext, RoundingMode } from "bigmath";

const DummyMc = new MathContext(10, 20, RoundingMode.HalfUp);

export const SyntaxCheckValue = new BigNumber(0, DummyMc);

// evaluate returns EvalValue
export type EvalValue = BigNumber | Eval.Matrix;

// execute return EvalDeclValue
export type EvalDeclValue = EvalValue | Eval.Declaration;

export function isEvalValue(a: unknown): a is EvalValue {
    return a instanceof BigNumber || a instanceof Eval.Matrix;
}

export function isEvalValueList(valueList: EvalDeclValue[]): valueList is EvalValue[] {
    return valueList.every(e => Eval.isEvalValue(e));
}

export function requireSingleEvalValue(valueList: EvalDeclValue[], state: Eval.EvalState): EvalValue {
    if (valueList.length !== 1) {
        throw Eval.EvalError.SyntaxError(state, Eval.EvalErrorCode.ExpectedSingleValue);
    }
    else if (Eval.isEvalValue(valueList[0])) {
        return valueList[0];
    }
    else {
        throw Eval.EvalError.SyntaxError(state, Eval.EvalErrorCode.ExpectedSingleValue);
    }
}

export const requireBigNumber = (a: EvalValue | undefined): BigNumber => {
    if (a instanceof BigNumber) {
        return a;
    }
    else {
        Assert.interrupt("Required BigNumber, got \"" + a + "\".");
    }
}

export function evaluateFunction(name: string, args: EvalValue[], state: Eval.EvalState) {
    return new Promise<EvalValue>((resolve, reject) => {
        // User declared functions
        let decl = state.getFunction(name);
        if (decl) {
            decl.call(args, state).then(v => resolve(v)).catch(e => reject(e));
            return;
        }

        // Built-in functions
        let func = Eval.BuiltInFunctions.get(name);
        if (func) {
            func.call(args, state).then(value => resolve(value)).catch(err => reject(err));
            return;
        }

        reject(Eval.EvalError.SyntaxError(state, Eval.EvalErrorCode.UndeclaredFunction, name));
    });
}

export function validateResult(a: EvalValue | undefined, state: Eval.EvalState): EvalValue {
    if (a === undefined) {
        throw Eval.EvalError.MathError(state);
    }
    else if (isBigNumber(a) && a.isNaN()) {
        throw Eval.EvalError.MathError(state);
    }
    else {
        return a;
    }
}
