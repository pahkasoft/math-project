import { EvalState, ArgCountTypes } from "eval";
import { Helpers } from "bigmath";
import { Utils } from "@tspro/ts-utils-lib";
import Fmt from "@tspro/brace-format";

export enum EvalErrorCode {
    UnexpectedData = 123,
    ExpectedValueList,
    ExpectedSingleValue,
    EmptyExpression,
    InadequateExpression,
    InvalidDeclaration,
    InvalidValue,
    InvalidOperator,
    InvalidVariableName,
    InvalidFunctionName,
    InvalidFunctionParameters,
    UndeclaredVariable,
    UndeclaredFunction,
    DeclaringReservedWord,
    SyntaxCheckFailed,
}

export function getErrorCodeString(code: EvalErrorCode) {
    return Utils.Str.makeSentenceFromPascal(EvalErrorCode[code]);
}

export class EvalInterrupted { }

export class EvalError {
    private constructor(public readonly state: EvalState, public readonly message: string) { }

    getErrorMessage(): string {
        let inLine = "in line " + this.state.lineNumber;

        let fn = this.state.getErrorFunction();
        let inFn = fn ? (" in function \"" + fn + "\"") : "";

        return this.message + " (" + inLine + inFn + ")";
    }

    static MathError(state: EvalState, msg?: string) {
        if (msg) {
            return new EvalError(state, "Math Error (" + msg + ")");
        }
        else {
            return new EvalError(state, "Math Error");
        }
    }

    static SyntaxError(state: EvalState, code?: EvalErrorCode, msg?: string) {
        if (code) {
            return new EvalError(
                state,
                Fmt.format("{} {}", getErrorCodeString(code), msg ? ("\"" + msg + "\"") : "")
            );
        }
        else {
            return new EvalError(state, "Syntax Error");
        }
    }

    static InvalidNumber(state: EvalState, value: string, base: number) {
        return new EvalError(
            state,
            Fmt.format("Invalid number \"{}\" in {}", value, Helpers.getBaseName(base, true))
        );
    }

    static InvalidFunctionArgumentCount(state: EvalState, fn: string, required: ArgCountTypes, given: number) {
        return new EvalError(
            state,
            Fmt.format("Invalid argument count for \"{}\", {} required, {} given", fn, required.toString(), given)
        );
    }

}
