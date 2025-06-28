import { EvalValue, FunctionDeclaration, VariableDeclaration, EvalDeclValue, isEvalValue } from "eval";
import { Assert, Stack } from "@tspro/ts-utils-lib";
import { Vocabulary } from "parser/vocabulary";
import { MathContext, BigNumber, RoundingMode } from "bigmath";
import { StopWatch } from "./stopwatch";

function getVariableConstant(name: string): BigNumber | undefined {
    switch (name) {
        case "π":
        case "pi":
            return BigNumber.pi;
        case "e":
            return BigNumber.e;
        case "inf":
            return new BigNumber(Infinity, new MathContext(10, 10, RoundingMode.HalfUp));
    }
    return undefined;
}

export enum ProgressElement { LeafNode }
export type ProgressListener = (element: ProgressElement) => void;

export interface QueryLineAns {
    queryLineAns(line: number): EvalValue | undefined;
}

class Params {
    private readonly variables = new Map<string, EvalValue>();
    private readonly functions = new Map<string, FunctionDeclaration>()

    constructor(params?: string[], args?: EvalValue[]) {
        Assert.assert(params && args || !params && !args);
        if (params && args) {
            let n = Assert.eq(params.length, args.length);
            for (let i = 0; i < n; i++) {
                this.variables.set(params[i], args[i]);
            }
        }
    }

    setVariable(name: string, value: EvalValue) {
        this.variables.set(name, value);
    }

    getVariable(name: string) {
        return this.variables.get(name);
    }

    setFunction(name: string, value: FunctionDeclaration) {
        this.functions.set(name, value);
    }

    getFunction(name: string) {
        return this.functions.get(name);
    }

    clone() {
        let copy = new Params();
        this.variables.forEach((value, key) => copy.variables.set(key, value));
        this.functions.forEach((value, key) => copy.functions.set(key, value));
        return copy;
    }
}

class FunctionState {
    globalParams: Params;
    localParams = new Params();
    localParamsStack = new Stack<Params>();

    constructor(readonly prevState: FunctionState | undefined, readonly name: string, readonly lineNumber: number) {
        this.globalParams = prevState ? prevState.globalParams.clone() : new Params();
    }

    pushLocalParams(localParams: Params) {
        this.localParamsStack.push(this.localParams)
        this.localParams = localParams;
    }

    popLocalParams() {
        this.localParams = this.localParamsStack.pop()
    }

    getLocalVariable(name: string) {
        let localParamsList = [...this.localParamsStack.toArray(), this.localParams].reverse();

        for (let localParams of localParamsList) {
            let value = localParams.getVariable(name);
            if (value) {
                return value;
            }
        }

        return undefined;
    }

    getGlobalVariable(name: string) {
        return this.globalParams.getVariable(name);
    }

    getGlobalFunction(name: string) {
        return this.globalParams.getFunction(name);
    }

    getVariable(name: string) {
        return this.getLocalVariable(name) || this.getGlobalVariable(name) || getVariableConstant(name);
    }

    getFunction(name: string) {
        return this.getGlobalFunction(name);
    }

    saveDeclaration(decl: EvalDeclValue) {
        if (decl instanceof VariableDeclaration) {
            this.globalParams.setVariable(decl.name, decl.value);
        }
        else if (decl instanceof FunctionDeclaration) {
            this.globalParams.setFunction(decl.name, decl);
        }
    }

    saveAns(ans: EvalValue) {
        this.globalParams.setVariable(Vocabulary.ans, ans);
    }
}

export class EvalState {
    private interruptRequested: boolean = false;
    private breakCounter = 0;
    private breakStopWatch = new StopWatch();

    functionState: FunctionState;
    functionStateStack = new Stack<FunctionState>();

    syntaxCheck: boolean;
    syntaxCheckStack = new Stack<boolean>();

    ownAns?: EvalValue;

    _mc?: MathContext;

    constructor(readonly prevState?: EvalState, readonly queryLineAns?: QueryLineAns) {
        let line = prevState ? (prevState.lineNumber + 1) : 1;

        this.functionState = new FunctionState(this.prevState && this.prevState.functionState, "<root>", line);
        this.functionStateStack.clear();

        this.syntaxCheck = false;
        this.syntaxCheckStack.clear();
    }

    setMathContext(mc: MathContext) {
        this._mc = mc;
    }

    requestInterrupt() {
        this.interruptRequested = true;
    }

    isInterruptRequested() {
        return this.interruptRequested;
    }

    needBreak() {
        if (++this.breakCounter > 100 && this.breakStopWatch.getIntervalMs() > 100) {
            this.breakCounter = 0;
            this.breakStopWatch.start();
            return true;
        }
        else {
            return false;
        }
    }

    get mc() {
        return Assert.require(this._mc);
    }

    get lineNumber() {
        return this.functionState.lineNumber;
    }

    pushFunctionCall(decl: FunctionDeclaration, args: EvalValue[]) {
        this.functionStateStack.push(this.functionState);
        this.functionState = new FunctionState(decl.state.functionState, decl.name, decl.state.lineNumber);
        this.functionState.pushLocalParams(new Params(decl.parameters, args));
    }

    popFunctionCall() {
        this.functionState = this.functionStateStack.pop();
    }

    pushLocalParams(names: string[], values: EvalValue[]) {
        this.functionState.pushLocalParams(new Params(names, values));
    }

    popLocalParams() {
        this.functionState.popLocalParams();
    }

    useSyntaxCheck() {
        this.syntaxCheckStack.push(this.syntaxCheck);
        this.syntaxCheck = true;
    }

    cancelSyntaxCheck() {
        this.syntaxCheck = this.syntaxCheckStack.pop();
    }

    getVariable(name: string) {
        return this.functionState.getVariable(name);
    }

    getFunction(name: string): FunctionDeclaration | undefined {
        return this.functionState.getFunction(name);
    }

    saveDeclaration(decl: EvalDeclValue) {
        this.functionState.saveDeclaration(decl);
    }

    saveAns(ans: EvalDeclValue) {
        if (isEvalValue(ans)) {
            this.ownAns = ans;
            this.functionState.saveAns(ans);
        }
    }

    getErrorFunction(): string | undefined {
        if (this.syntaxCheck) {
            return undefined;
        }
        else {
            let fsList = [...this.functionStateStack.toArray(), this.functionState];
            return fsList.length > 1 ? fsList[fsList.length - 1].name : undefined;
        }
    }
}
