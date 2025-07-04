import * as React from "react";
import { BigMath, Engine, Eval, Parser } from "math-lib";
import { MathApp } from "./math-app";
import { Table } from "react-bootstrap";
import { MathLine, MathLineComponent } from "math-line";
import { MyInput } from "ui/my-input";
import { Settings } from "./settings";
import { Assert } from "@tspro/ts-utils-lib";

export interface MathDocumentProps {
    app: MathApp;
}

export interface MathDocumentState {
    lines: MathLine[];
}

export class MathDocument extends React.Component<MathDocumentProps, MathDocumentState> implements Eval.QueryLineAns {
    private readonly refDiv = React.createRef<HTMLDivElement>();
    private readonly refInput = React.createRef<MyInput>();

    private _isCalculating: boolean = false;

    state: MathDocumentState;

    get isCalculating() {
        return this._isCalculating;
    }

    set isCalculating(isCalculating: boolean) {
        this._isCalculating = this.app.isCalculating = isCalculating;
    }

    constructor(props: MathDocumentProps) {
        super(props);

        this.state = this.addLineGetState(true);

        document.addEventListener("keydown", e => {
            let keyCode = e.which || e.keyCode;

            if (e.ctrlKey) {
                if (e.key === "z" || keyCode === 90) {
                    this.undo();
                    e.preventDefault();
                }
                else if (e.key === "y" || keyCode === 89) {
                    this.redo();
                    e.preventDefault();
                }
            }
        });
    }

    queryLineAns(lineNumber: number): Eval.EvalValue | undefined {
        let line = this.state.lines.find(line => line.evalState.lineNumber === lineNumber);
        return line ? line.evalState.ownAns : undefined;
    }

    empty() {
        this.setState(this.addLineGetState(true));
    }

    get app() {
        return this.props.app;
    }

    scrollToBottom() {
        this.props.app.scrollToBottom();
    }

    getLine(lineId: number): MathLine {
        let { lines } = this.state;
        return Assert.array_elem(lines, lineId);
    }

    getActiveLine(): MathLine {
        let { lines } = this.state;
        return Assert.array_elem(lines, lines.length - 1);
    }

    addLineGetState(removeLines = false): MathDocumentState {
        let lines: MathLine[] = removeLines ? [] : this.state.lines;

        let prevLine = lines.length > 0 ? lines[lines.length - 1] : undefined;
        let nextState = new Eval.EvalState(prevLine?.evalState, this);
        let nextLine = new MathLine(this, Engine.MathObject.create(), nextState);

        MyInput.focus();

        if (prevLine) {
            prevLine.mathObject.hideCursor();
        }

        nextLine.mathObject.showCursor(0);

        return { lines: [...lines, nextLine] }
    }

    setResult(line: MathLine, result: Eval.EvalValue) {
        let mc = new BigMath.MathContext(
            Settings.displayBase,
            Settings.displayPrecision,
            BigMath.RoundingMode.HalfUp);

        let resultExpr = Engine.expressionFromValue(mc, result, true);

        line.mathObject.rootNode.clearResult();
        line.mathObject.rootNode.addResultExpr(resultExpr);
    }

    onSuccess(line: MathLine, values: Eval.EvalDeclValue[]) {
        this.isCalculating = false;

        if (values.length === 1 && Eval.isEvalValue(values[0])) {
            this.setResult(line, values[0]);
        }

        this.setState(this.addLineGetState());
    }

    onError(line: MathLine, error: unknown) {
        this.isCalculating = false;

        if (error instanceof Eval.EvalInterrupted) {
            console.log("Eval interrupted.")
        }
        else if (error instanceof Eval.EvalError) {
            this.app.setError(error);
        }
        else {
            this.app.setError("Internal error. See console for more info.");
            console.error(error);
        }
    }

    calculate() {
        this.isCalculating = true;

        this.app.clearError();

        let line = this.getActiveLine();

        let mc = new BigMath.MathContext(
            Settings.displayBase,
            Settings.internalPrecision,
            BigMath.RoundingMode.HalfUp);

        line.setMathContext(mc);

        line.mathObject.execute(line.evalState).
            then(values => this.onSuccess(line, values)).
            catch(err => this.onError(line, err));
    }

    canUndo() {
        return !this.isCalculating && this.getActiveLine().mathObject.history.canUndo();
    }

    undo() {
        if (this.isCalculating) {
            return;
        }
        this.getActiveLine().mathObject.history.undo();
    }

    canRedo() {
        return !this.isCalculating && this.getActiveLine().mathObject.history.canRedo();
    }

    redo() {
        if (this.isCalculating) {
            return;
        }
        this.getActiveLine().mathObject.history.redo();
    }

    handleInput(input: string, data?: string) {
        if (this.isCalculating) {
            return;
        }

        let { mathObject } = this.getActiveLine();
        let { editor } = mathObject;

        let saveHistory = true;

        const onUnhandledInput = () => {
            console.warn("Unhandled input=" + input + ", data='" + (data ?? "") + "'");
            saveHistory = false;
        }

        switch (input) {
            case MyInput.ArrowUp:
            case MyInput.ArrowDown:
                saveHistory = false;
                break;
            case MyInput.ArrowLeft:
                editor.moveSelectionLeft();
                saveHistory = false;
                break;
            case MyInput.ArrowRight:
                editor.moveSelectionRight();
                saveHistory = false;
                break;
            case MyInput.Home:
                editor.setSelection("left");
                saveHistory = false;
                break;
            case MyInput.End:
                editor.setSelection("right");
                saveHistory = false;
                break;
            case MyInput.Delete:
                editor.handleDelete();
                break;
            case MyInput.Backspace:
                editor.handleBackspace();
                break;
            case MyInput.InsertFunction:
                if (data) {
                    editor.insertFunction(data);
                }
                else {
                    onUnhandledInput();
                }
                break;
            case MyInput.InsertMatrix:
                if (data && data.indexOf("M") >= 0 && data.indexOf("x") >= 0) {
                    // Format: "M3x3"
                    let rows = +data.charAt(data.indexOf("M") + 1);
                    let cols = +data.charAt(data.indexOf("x") + 1);
                    editor.insertMatrix(Assert.int_gt(rows, 0), Assert.int_gt(cols, 0));
                }
                else {
                    onUnhandledInput();
                }
                break;
            case MyInput.Enter:
                this.calculate();
                saveHistory = false;
                break;
            default:
                if (!editor.insertSymbols(input)) {
                    onUnhandledInput();
                }
                break;
        }

        if (saveHistory) {
            mathObject.history.savePage();
        }

        MyInput.focus();

        this.scrollToBottom();
    }

    render() {
        let { lines } = this.state;

        const onKey = (key: string) => {
            if (key === "=") {
                this.handleInput(MyInput.Enter);
            }
            else if (key === ":") {
                this.handleInput(Parser.Vocabulary.opDeclare);
            }
            else if (key === "/") {
                this.handleInput(MyInput.InsertFunction, Parser.Vocabulary.frac);
            }
            else {
                this.handleInput(key);
            }
        }

        const showCursor = () => this.getActiveLine().mathObject.showCursor();
        const hideCursor = () => this.getActiveLine().mathObject.hideCursor();

        return (
            <div className="document" ref={this.refDiv}>
                <Table bordered size="sm">
                    <tbody>
                        {lines.map(line => {
                            return (
                                <tr key={line.evalState.lineNumber}>
                                    <td style={{ verticalAlign: "middle" }}>
                                        {line.evalState.lineNumber}
                                    </td>
                                    <td style={{ width: "99%" }}>
                                        <MathLineComponent line={line} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>

                <MyInput ref={this.refInput} onKey={onKey} onFocus={showCursor} onBlur={hideCursor} />
            </div>
        );
    }

}
