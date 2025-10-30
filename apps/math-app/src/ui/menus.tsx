import * as React from "react";
import { Dropdown } from "react-bootstrap";
import { Vocabulary } from "@tspro/math-lib/parser";
import { FractionIcon, ExponentIcon, RadicalIcon, MatrixIcon, AppMenuIcon } from "./icons";
import { SimpleDropDown } from "./components";
import { MathApp } from "math-app";
import { Utils } from "@tspro/ts-utils-lib";

const MaxMatrixSize = 5;

const LabelWithShortcut = (props: { label: string, shortcut: string }) => (
    <table style={{ width: "100%" }}><tbody><tr>
        <td style={{ width: "50%", textAlign: "left" }}>{props.label}</td>
        <td style={{ width: "50%", textAlign: "right", fontStyle: "italic" }}>{props.shortcut}</td>
    </tr></tbody></table>
);

export class SimpleMenuItem {
    public readonly label: React.JSX.Element | string;
    public readonly Component = () => <>{this.label}</>;
    constructor(readonly key: string, label?: React.JSX.Element | string) {
        this.label = label === undefined ? key : label;
    }
}

const OperatorMenuItems: SimpleMenuItem[] = [
    new SimpleMenuItem(Vocabulary.opPlus, "a + b"),
    new SimpleMenuItem(Vocabulary.opMinus, "a − b"),
    new SimpleMenuItem(Vocabulary.opMultiply, "a · b"),
    new SimpleMenuItem(Vocabulary.opCrossProd, "A ⨯ B"),
    new SimpleMenuItem(Vocabulary.opDivide, "a ÷ b"),
    new SimpleMenuItem(Vocabulary.opModulo, "a % b"),
    new SimpleMenuItem("(", "(a)"),
    new SimpleMenuItem(Vocabulary.frac, <FractionIcon a="a" b="b" />),
    new SimpleMenuItem(Vocabulary.opFactorial, "a! or a!!"),
    new SimpleMenuItem(Vocabulary.opPower, <ExponentIcon a="a" b="b" />),
    new SimpleMenuItem(Vocabulary.opTranspose, <ExponentIcon a="A" b="T" />),
    new SimpleMenuItem(Vocabulary.opDeclare, "a := b"),
];

const FunctionMenuItems: SimpleMenuItem[] = [
    new SimpleMenuItem(Vocabulary.ans, Vocabulary.ans + "(line)"),
    new SimpleMenuItem(Vocabulary.abs, Vocabulary.abs + " |x|"),
    new SimpleMenuItem(Vocabulary.sgn, Vocabulary.sgn + "(x)"),
    new SimpleMenuItem(Vocabulary.sqrt, <span>{Vocabulary.sqrt} <RadicalIcon y="" /></span>),
    new SimpleMenuItem(Vocabulary.nthroot, <span>{Vocabulary.nthroot} <RadicalIcon /></span>),
    new SimpleMenuItem(Vocabulary.log, <span>log<sub>b</sub>(x)</span>),
    new SimpleMenuItem(Vocabulary.ln, Vocabulary.ln + "(x)"),
    new SimpleMenuItem(Vocabulary.exp, Vocabulary.exp + "(x)"),
    new SimpleMenuItem(Vocabulary.sin, Vocabulary.sin + "(x)"),
    new SimpleMenuItem(Vocabulary.cos, Vocabulary.cos + "(x)"),
    new SimpleMenuItem(Vocabulary.tan, Vocabulary.tan + "(x)"),
    new SimpleMenuItem(Vocabulary.asin, Vocabulary.asin + "(x)"),
    new SimpleMenuItem(Vocabulary.acos, Vocabulary.acos + "(x)"),
    new SimpleMenuItem(Vocabulary.atan, Vocabulary.atan + "([y,] x)"),
    new SimpleMenuItem(Vocabulary.sinh, Vocabulary.sinh + "(x)"),
    new SimpleMenuItem(Vocabulary.cosh, Vocabulary.cosh + "(x)"),
    new SimpleMenuItem(Vocabulary.tanh, Vocabulary.tanh + "(x)"),
    new SimpleMenuItem(Vocabulary.asinh, Vocabulary.asinh + "(x)"),
    new SimpleMenuItem(Vocabulary.acosh, Vocabulary.acosh + "(x)"),
    new SimpleMenuItem(Vocabulary.atanh, Vocabulary.atanh + "(x)"),
    new SimpleMenuItem(Vocabulary.gcd, Vocabulary.gcd + "(n₁, n₂, ...)"),
    new SimpleMenuItem(Vocabulary.lcm, Vocabulary.lcm + "(n₁, n₂, ...)"),
    new SimpleMenuItem(Vocabulary.permutation, "permutation(n, r)"),
    new SimpleMenuItem(Vocabulary.combination, "combination(n, r)"),
    new SimpleMenuItem(Vocabulary.summation, Vocabulary.summation + " Σ"),
    new SimpleMenuItem(Vocabulary.product, Vocabulary.product + " Π"),
    new SimpleMenuItem(Vocabulary.transpose, Vocabulary.transpose + "(M)"),
    new SimpleMenuItem(Vocabulary.det, Vocabulary.det + "(M)"),
    new SimpleMenuItem(Vocabulary.min, Vocabulary.min + "(x₁, ...)"),
    new SimpleMenuItem(Vocabulary.max, Vocabulary.max + "(x₁, ...)"),
    new SimpleMenuItem(Vocabulary.clamp, Vocabulary.clamp + "(x, lo, hi)"),
    new SimpleMenuItem(Vocabulary.rnd, Vocabulary.rnd + "([lo,] hi)"),
    new SimpleMenuItem(Vocabulary.rndint, Vocabulary.rndint + "([lo,] hi)"),
    new SimpleMenuItem(Vocabulary.trunc, Vocabulary.trunc + "(x)"),
    new SimpleMenuItem(Vocabulary.round, Vocabulary.round + "(x [, dp])"),
    new SimpleMenuItem(Vocabulary.floor, Vocabulary.floor + " ⌊x⌋"),
    new SimpleMenuItem(Vocabulary.ceil, Vocabulary.ceil + " ⌈x⌉"),
].sort();

const SymbolMenuItems: SimpleMenuItem[] = [
    new SimpleMenuItem(Vocabulary.ans),
    new SimpleMenuItem("pi"),
    new SimpleMenuItem("e"),
    new SimpleMenuItem(Vocabulary.infinity),
    new SimpleMenuItem("inf"),
].sort();

interface AppMenuProps {
    app: MathApp
}

export const AppMenu = (props: AppMenuProps) => {
    let { app } = props;

    return (
        <SimpleDropDown button={<AppMenuIcon />} headerTitle="App Menu">
            <Dropdown.Item onClick={() => app.clearWorkspace()}>Clear Workspace</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => app.showAbout(true)}>About</Dropdown.Item>
        </SimpleDropDown>
    );
}

interface EditMenuProps {
    app: MathApp;
}

interface EditMenuState {
    canUndo: boolean;
    canRedo: boolean;
}

export class EditMenu extends React.Component<EditMenuProps, EditMenuState> {
    state: EditMenuState;

    constructor(props: EditMenuProps) {
        super(props);
        this.state = this.createState();
    }

    createState(): EditMenuState {
        let { doc } = this.props.app;
        let canUndo = !!doc?.canUndo();
        let canRedo = !!doc?.canRedo();
        return { canUndo, canRedo }
    }

    render() {
        let { app } = this.props;
        let { canUndo, canRedo } = this.state;

        const onMenuOpen = () => this.setState(this.createState());
        const onUndo = () => app.doc?.undo();
        const onRedo = () => app.doc?.redo();

        return (
            <SimpleDropDown button={"Edit"} headerTitle="Edit Menu" onMenuOpen={onMenuOpen}>
                <Dropdown.Item onClick={onUndo} disabled={!canUndo}>
                    <LabelWithShortcut label="Undo" shortcut="Ctrl+Z" />
                </Dropdown.Item>
                <Dropdown.Item onClick={onRedo} disabled={!canRedo}>
                    <LabelWithShortcut label="Redo" shortcut="Ctrl+Y" />
                </Dropdown.Item>
            </SimpleDropDown>
        );
    }
}

type OperatorMenuProps = { insert: (key: string) => void }

export const OperatorMenu = (props: OperatorMenuProps) => {
    return (
        <SimpleDropDown button="+−⨯" headerTitle="Insert Operator">
            {OperatorMenuItems.map(item => (
                <Dropdown.Item key={item.key} onClick={() => props.insert(item.key)}><item.Component /></Dropdown.Item>
            ))}
        </SimpleDropDown>
    );
}

type FunctionMenuProps = { insert: (key: string) => void }

export const FunctionMenu = (props: FunctionMenuProps) => {
    const insert = (item: SimpleMenuItem) => props.insert(item.key);
    return (
        <SimpleDropDown button="𝑓(x)" headerTitle="Insert Function">
            {FunctionMenuItems.map(item => <Dropdown.Item key={item.key} onClick={() => insert(item)}><item.Component /></Dropdown.Item>)}
        </SimpleDropDown>
    );
}

type SymbolMenuProps = { insert: (key: string) => void }

export const SymbolMenu = (props: SymbolMenuProps) => {
    const insert = (item: SimpleMenuItem) => props.insert(item.key);
    return (
        <SimpleDropDown button="abc" headerTitle="Insert Symbol">
            {SymbolMenuItems.map(item => <Dropdown.Item key={item.key} onClick={() => insert(item)}><item.Component /></Dropdown.Item>)}
        </SimpleDropDown>
    );
}

type MatrixMenuProps = { insert: (rows: number, cols: number) => void }
type MatrixMenuState = { rows: number, cols: number }

export class MatrixMenu extends React.Component<MatrixMenuProps, MatrixMenuState> {
    state: MatrixMenuState = { rows: 1, cols: 1 };

    constructor(props: MatrixMenuProps) {
        super(props);
    }

    render() {
        let { cols, rows } = this.state;

        const update = (rows: number, cols: number) => {
            this.setState(({ rows, cols }));
        }

        const insert = (rows: number, cols: number) => {
            this.props.insert(rows, cols);
        }

        return (
            <SimpleDropDown button={<MatrixIcon />} headerTitle="Insert Matrix">
                <table>
                    <tbody>
                        {Utils.Arr.mapSequenceArray(MaxMatrixSize, row =>
                            <tr key={row}>
                                {Utils.Arr.mapSequenceArray(MaxMatrixSize, col => (
                                    <td key={col} style={{ border: "1px solid black" }}>
                                        <Dropdown.Item className={col < cols && row < rows ? "bg-secondary" : ""}
                                            style={{ width: "2em", height: "2em", margin: "0.2em" }}
                                            onMouseMove={() => update(row + 1, col + 1)}
                                            onClick={() => insert(row + 1, col + 1)} />
                                    </td>
                                ))}
                            </tr>
                        )}
                    </tbody>
                </table>
            </SimpleDropDown>
        );
    }
}
