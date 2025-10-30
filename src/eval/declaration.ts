import { EvalValue, EvalError, EvalErrorCode, EvalState, ExpressionEvaluator, SyntaxCheckValue, FixedArgCount } from "eval";
import { Grammar } from "parser/grammar";

export class Declaration {
    constructor(readonly name: string) { }
}

export class VariableDeclaration extends Declaration {
    readonly value: EvalValue

    private constructor(name: string, value: EvalValue) {
        super(name);
        this.value = value
    }

    public static create(evaluator: ExpressionEvaluator, state: EvalState) {
        return new Promise<VariableDeclaration>((resolve, reject) => {
            let name = evaluator.getDeclName();

            if (!evaluator.isVariableDeclaration()) {
                reject(EvalError.SyntaxError(state, EvalErrorCode.InvalidDeclaration));
                return;
            }
            else if (!Grammar.isVariable(name)) {
                reject(EvalError.SyntaxError(state, EvalErrorCode.InvalidVariableName, name));
                return;
            }
            else if (Grammar.isReservedWord(name)) {
                reject(EvalError.SyntaxError(state, EvalErrorCode.DeclaringReservedWord, name));
                return;
            }

            evaluator.evaluate(state).
                then(value => resolve(new VariableDeclaration(name, value))).
                catch(err => reject(err));
        });
    }

}

export class FunctionDeclaration extends Declaration {
    private constructor(readonly evaluator: ExpressionEvaluator, readonly parameters: string[], readonly state: EvalState) {
        super(evaluator.getDeclName());
    }

    public static create(evaluator: ExpressionEvaluator, state: EvalState) {
        return new Promise<FunctionDeclaration>((resolve, reject) => {
            let name = evaluator.getDeclName();

            if (!evaluator.isFunctionDeclaration()) {
                reject(EvalError.SyntaxError(state, EvalErrorCode.InvalidDeclaration));
                return;
            }
            else if (!Grammar.isVariable(name)) {
                reject(EvalError.SyntaxError(state, EvalErrorCode.InvalidFunctionName, name));
                return;
            }
            else if (Grammar.isReservedWord(name)) {
                reject(EvalError.SyntaxError(state, EvalErrorCode.DeclaringReservedWord, name));
                return;
            }

            let bracketNode = evaluator.getDeclBracket();

            let paramsStr = bracketNode.getExpression().toString();
            let params = paramsStr.split(",").map(s => s.trim());

            if (params.length === 0 || !params.every(name => Grammar.isVariable(name))) {
                reject(EvalError.SyntaxError(state, EvalErrorCode.InvalidFunctionParameters, paramsStr || "<empty>"));
                return;
            }
            else if (evaluator.nodeList.length === 0) {
                reject(EvalError.SyntaxError(state, EvalErrorCode.EmptyExpression));
                return;
            }

            let decl = new FunctionDeclaration(evaluator, params, state);

            let args = new Array(params.length).fill(SyntaxCheckValue);

            state.useSyntaxCheck();

            decl.call(args, state).
                then(result => {
                    if (result === SyntaxCheckValue) {
                        resolve(decl);
                    }
                    else {
                        reject(EvalError.SyntaxError(state, EvalErrorCode.SyntaxCheckFailed));
                    }
                    state.cancelSyntaxCheck();
                }).
                catch(err => reject(err));
        });
    }

    public call(args: EvalValue[], state: EvalState) {
        return new Promise<EvalValue>((resolve, reject) => {
            if (args.length !== this.parameters.length) {
                let requiredArgs = new FixedArgCount(this.parameters.length);
                reject(EvalError.InvalidFunctionArgumentCount(state, this.name, requiredArgs, args.length));
                return;
            }

            state.pushFunctionCall(this, args);

            this.evaluator.evaluate(state).
                then(v => { resolve(v); state.popFunctionCall(); }).
                catch(err => reject(err));
        });
    }

}

