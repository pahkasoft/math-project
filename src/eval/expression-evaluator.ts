import { Nodes } from "engine/nodes";
import { Assert, Utils } from "@tspro/ts-utils-lib";
import { Vocabulary } from "parser/vocabulary";
import * as Eval from "eval";
import { Grammar } from "parser/grammar";
import { BigNumber } from "bigmath";

export class ExpressionEvaluator {
    readonly nodeList: Nodes.NNode[] = [];

    readonly declNodeList?: Nodes.NSymbol[];
    readonly declBracket?: Nodes.NBracket;

    constructor(readonly expr: Nodes.NExpression, nodeList: Nodes.NNode[]) {
        this.nodeList = nodeList.filter(n => !(Assert.require(n) instanceof Nodes.NSpace));

        // Parse declaration nodes
        let startSymbols: Nodes.NSymbol[] = [];
        for (let i = 0; this.nodeList[i] instanceof Nodes.NSymbol; i++) {
            startSymbols.push(this.nodeList[i] as Nodes.NSymbol);
        }
        let varName = startSymbols.map(n => n.toString()).join("");

        let n1 = this.nodeList[startSymbols.length];
        let n2 = this.nodeList[startSymbols.length + 1];

        if (varName.length > 0 && Grammar.isVariable(varName)) {
            if (n1 instanceof Nodes.NDeclare) {
                // Variable declaration ["x", ":="]
                this.declNodeList = startSymbols;
                this.declBracket = undefined;
                this.nodeList.splice(0, startSymbols.length + 1);
            }
            else if (n1 instanceof Nodes.NBracket && n2 instanceof Nodes.NDeclare) {
                // Function declaration ["f", "(...)", ":="]
                this.declNodeList = startSymbols;
                this.declBracket = n1;
                this.nodeList.splice(0, startSymbols.length + 2);
            }
        }
    }

    isVariableDeclaration(): boolean {
        return this.declNodeList !== undefined && this.declBracket === undefined;
    }

    isFunctionDeclaration(): boolean {
        return this.declNodeList !== undefined && this.declBracket !== undefined;
    }

    getDeclName(): string {
        return this.declNodeList ? this.declNodeList.map(n => n.toString()).join("") : "";
    }

    getDeclBracket(): Nodes.NBracket {
        return Assert.require(this.declBracket);
    }

    private nodeIndex: number = 0;
    private lookNode: Nodes.NNode | undefined = undefined;

    private initialize(state: Eval.EvalState) {
        this.nodeIndex = 0;
        this.nextNode();
    }

    private nodeAt(i: number) {
        return i >= 0 && i < this.nodeList.length ? this.nodeList[i] : undefined;
    }

    private nextNode() {
        this.lookNode = this.nodeAt(this.nodeIndex++);
    }

    toString() {
        let exprStr = this.nodeList.map(n => n.toString()).join("");
        if (this.isVariableDeclaration()) {
            return this.getDeclName() + Vocabulary.opDeclare + exprStr;
        }
        else if (this.isFunctionDeclaration()) {
            return this.getDeclName() + this.getDeclBracket().toString() + Vocabulary.opDeclare + exprStr;
        }
        else {
            return exprStr;
        }
    }

    public evaluate(state: Eval.EvalState) {
        return new Promise<Eval.EvalValue>((resolve, reject) => {
            this.initialize(state);

            resolve(this.evaluateExpression(state));
        });
    }

    public execute(state: Eval.EvalState) {
        return new Promise<Eval.EvalDeclValue>((resolve, reject) => {
            this.initialize(state);

            if (this.isVariableDeclaration()) {
                resolve(Eval.VariableDeclaration.create(this, state));
            }
            else if (this.isFunctionDeclaration()) {
                resolve(Eval.FunctionDeclaration.create(this, state));
            }
            else {
                resolve(this.evaluateExpression(state));
            }
        });
    }

    private evaluateExpression(state: Eval.EvalState) {
        return new Promise<Eval.EvalValue>((resolve, reject) => {
            if (this.nodeList.length === 0) {
                reject(Eval.EvalError.SyntaxError(state, Eval.EvalErrorCode.EmptyExpression));
                return;
            }

            this.evaluateFirstTerm(state).
                then(term => resolve(this.evaluateNextTerm(term, state))).
                catch(err => reject(err));
        });
    }

    private evaluateFirstTerm(state: Eval.EvalState) {
        return new Promise<Eval.EvalValue>((resolve, reject) => {
            resolve(this.evaluateFirstFactor(state));
        });
    }

    private evaluateNextTerm(sum: Eval.EvalValue, state: Eval.EvalState) {
        return new Promise<Eval.EvalValue>((resolve, reject) => {
            if (this.lookNode instanceof Nodes.NTermOp) {
                let op = this.lookNode;
                this.nextNode();

                this.evaluateFirstFactor(state).
                    then(factor => {
                        let termOp = undefined;
                        if (op.isAdd()) { termOp = Eval.fnAdd; }
                        else if (op.isSubtract()) { termOp = Eval.fnSub; }

                        Assert.assert(termOp !== undefined, "termOp");
                        sum = termOp!(sum, factor, state);

                        resolve(this.evaluateNextTerm(sum, state));
                    }).catch(err => reject(err));
            }
            else if (this.lookNode === undefined || this.lookNode instanceof Nodes.NComma) {
                resolve(sum);
            }
            else {
                reject(Eval.EvalError.SyntaxError(state, Eval.EvalErrorCode.UnexpectedData, this.lookNode.toString()));
            }
        });
    }

    private evaluateFirstFactor(state: Eval.EvalState) {
        return new Promise<Eval.EvalValue>((resolve, reject) => {
            this.evaluateSignedFactor(state).
                then(prod => resolve(this.evaluateNextFactor(prod, state))).
                catch(err => reject(err));
        });
    }

    private evaluateNextFactor(prod: Eval.EvalValue, state: Eval.EvalState) {
        return new Promise<Eval.EvalValue>((resolve, reject) => {
            if (this.lookNode instanceof Nodes.NFactorOp) {
                let op = this.lookNode;
                this.nextNode();

                this.evaluateSignedFactor(state).
                    then(primary => {
                        let factorOp = undefined;
                        if (op.isMultiply()) { factorOp = Eval.fnMul; }
                        else if (op.isDivide()) { factorOp = Eval.fnDiv; }
                        else if (op.isModulo()) { factorOp = Eval.fnMod; }
                        else if (op.isCrossProduct()) { factorOp = Eval.fnCrossProd; }

                        Assert.assert(factorOp !== undefined, "factorOp");
                        prod = factorOp!(prod, primary, state);

                        resolve(this.evaluateNextFactor(prod, state));
                    }).
                    catch(err => reject(err));
            }
            else {
                resolve(prod);
            }
        });

    }

    private evaluateSignedFactor(state: Eval.EvalState) {
        return new Promise<Eval.EvalValue>((resolve, reject) => {
            if (this.lookNode instanceof Nodes.NTermOp) {
                let neg = this.lookNode.isSubtract();
                this.nextNode();

                this.evaluateSignedFactor(state).
                    then(primary => resolve(neg ? Eval.fnNegate(primary, state) : primary)).
                    catch(err => reject(err));
            }
            else {
                resolve(this.evaluatePrimary(state));
            }
        });
    }

    private evaluatePrimary(state: Eval.EvalState) {
        return new Promise<Eval.EvalValue>((resolve, reject) => {
            let primaryNode = this.lookNode;
            this.nextNode();

            if (primaryNode instanceof Nodes.NSymbol) {
                let symbols = [primaryNode];
                while (this.lookNode instanceof Nodes.NSymbol) {
                    symbols.push(this.lookNode);
                    this.nextNode();
                }

                this.evaluateSymbolNodes(symbols, state).
                    then(result => resolve(this.evaluatePrimaryOp(result, state))).
                    catch(err => reject(err));
                return;
            }
            else if (primaryNode && primaryNode.isEvaluable()) {
                primaryNode.evaluate(state).
                    then(result => resolve(this.evaluatePrimaryOp(result, state))).
                    catch(err => reject(err));
                return;
            }
            else {
                reject(Eval.EvalError.SyntaxError(state, Eval.EvalErrorCode.InadequateExpression));
                return;
            }
        });
    }

    private evaluatePrimaryOp(value: Eval.EvalValue, state: Eval.EvalState) {
        return new Promise<Eval.EvalValue>((resolve, reject) => {
            if (!(this.lookNode instanceof Nodes.NPrimaryOp)) {
                resolve(value);
                return;
            }

            let primaryOp = this.lookNode;
            this.nextNode();

            if (primaryOp instanceof Nodes.NFactorial) {
                let exclamationMarkCount = 1;
                while (this.lookNode instanceof Nodes.NFactorial) {
                    this.nextNode();
                    exclamationMarkCount++;
                }
                if (exclamationMarkCount === 1) {
                    value = Eval.fnFactorial(value, state);
                }
                else if (exclamationMarkCount === 2) {
                    value = Eval.fnDoubleFactorial(value, state);
                }
                else {
                    reject(Eval.EvalError.SyntaxError(state, Eval.EvalErrorCode.InvalidOperator, Utils.Str.repeatString("!", exclamationMarkCount)));
                    return;
                }
            }
            else if (primaryOp instanceof Nodes.NTranspose) {
                value = Eval.fnTranspose(value, state);
            }
            else if (primaryOp instanceof Nodes.NExponent) {
                primaryOp.getExponent().evaluate(state).
                    then(exp => {
                        value = Eval.fnPow(value, exp, state);
                        resolve(this.evaluatePrimaryOp(value, state));
                    }).
                    catch(err => reject(err));
                return;
            }
            else {
                reject(Eval.EvalError.SyntaxError(state, Eval.EvalErrorCode.UnexpectedData, primaryOp.toString()));
                return;
            }

            resolve(this.evaluatePrimaryOp(value, state));
        });
    }

    private evaluateSymbolNodes(symbolNodes: Nodes.NSymbol[], state: Eval.EvalState) {
        return new Promise<Eval.EvalValue>((resolve, reject) => {

            const symbolStr = symbolNodes.map(n => n.toString()).join("");

            if (Grammar.isNumber(symbolStr)) {
                let numberStr = symbolStr;
                let numberMC = state.mc;

                let value = new BigNumber(numberStr, numberMC);

                if (value.isNaN()) {
                    reject(Eval.EvalError.InvalidNumber(state, numberStr, numberMC.base));
                    return;
                }
                else {
                    resolve(state.syntaxCheck ? Eval.SyntaxCheckValue : value);
                    return;
                }
            }
            else if (Grammar.isVariable(symbolStr)) {
                if (this.lookNode instanceof Nodes.NBracket) {
                    let bracketNode = this.lookNode;
                    this.nextNode();

                    const fnName = symbolStr;
                    const fnArgs: Eval.EvalValue[] = [];

                    bracketNode.getExpression().executeList(state, false).
                        then(valueList => {
                            valueList.forEach(v => {
                                if (Eval.isEvalValue(v)) {
                                    fnArgs.push(v);
                                }
                                else {
                                    reject(Eval.EvalError.SyntaxError(state, Eval.EvalErrorCode.ExpectedValueList))
                                }
                            });
                            Eval.evaluateFunction(fnName, fnArgs, state).
                                then(v => resolve(v)).
                                catch(err => reject(err));
                        }).
                        catch(err => reject(err));

                    return;
                }
                else {
                    let varName = symbolStr;
                    let value = state.getVariable(varName);
                    if (value) {
                        resolve(state.syntaxCheck ? Eval.SyntaxCheckValue : value);
                        return;
                    }
                    else {
                        reject(Eval.EvalError.SyntaxError(state, Eval.EvalErrorCode.UndeclaredVariable, varName));
                        return;
                    }
                }
            }
            else {
                reject(Eval.EvalError.SyntaxError(state, Eval.EvalErrorCode.InvalidValue, symbolStr));
                return;
            }
        });
    }

}

