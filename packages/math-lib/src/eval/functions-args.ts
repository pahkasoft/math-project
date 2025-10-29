import { EvalState, EvalError, EvalValue } from "eval";
import { Assert, UniMap } from "@tspro/ts-utils-lib";

export class FixedArgCount {
    constructor(readonly fixed: number) { }
    validate(argCount: number) { return argCount === this.fixed; }
    toString() { return this.fixed; }
}

export class MinArgCount {
    constructor(readonly min: number) { }
    validate(argCount: number) { return argCount >= this.min; }
    toString() { return "at least " + this.min; }
}

export class RangeArgCount {
    constructor(readonly min: number, readonly max: number) { }
    validate(argCount: number) { return argCount >= this.min && argCount <= this.max; }
    toString() { return "from " + this.min + " to " + this.max; }
}

export type ArgCountTypes = FixedArgCount | MinArgCount | RangeArgCount;

type FixedArgFunctionType =
    ((a: EvalValue, state: EvalState) => EvalValue) |
    ((a: EvalValue, b: EvalValue, state: EvalState) => EvalValue) |
    ((a: EvalValue, b: EvalValue, c: EvalValue, state: EvalState) => EvalValue);

type ArrayArgFunctionType = ((a: EvalValue[], state: EvalState) => EvalValue);

class FixedArgFunctionData {
    constructor(readonly name: string, readonly args: FixedArgCount, readonly func: FixedArgFunctionType) { }
    call(args: EvalValue[], state: EvalState) {
        return new Promise<EvalValue>((resolve, reject) => {
            if (this.args.validate(args.length)) {
                resolve((<any>this.func)(...args, state));
            }
            else {
                reject(EvalError.InvalidFunctionArgumentCount(state, this.name, this.args, args.length));
            }
        });
    }
}

class ArrayArgFunctionData {
    constructor(readonly name: string, readonly args: MinArgCount | RangeArgCount, readonly func: ArrayArgFunctionType) { }
    call(args: EvalValue[], state: EvalState) {
        return new Promise<EvalValue>((resolve, reject) => {
            if (this.args.validate(args.length)) {
                resolve(this.func(args, state));
            }
            else {
                reject(EvalError.InvalidFunctionArgumentCount(state, this.name, this.args, args.length));
            }
        });
    }
}

export const fn_with_fixed_args = (name: string, fixed: number, func: FixedArgFunctionType) => new FixedArgFunctionData(name, new FixedArgCount(fixed), func);
export const fn_with_min_args = (name: string, min: number, func: ArrayArgFunctionType) => new ArrayArgFunctionData(name, new MinArgCount(min), func);
export const fn_with_range_args = (name: string, min: number, max: number, func: ArrayArgFunctionType) => new ArrayArgFunctionData(name, new RangeArgCount(min, max), func);

export type FunctionData = FixedArgFunctionData | ArrayArgFunctionData;

export function initFunctionMap(list: FunctionData[]) {
    let map = new UniMap<string, FunctionData>();
    list.forEach(data => {
        Assert.assert(!map.has(data.name), "Duplicate function.");
        map.set(data.name, data);
    });
    return map;
}
