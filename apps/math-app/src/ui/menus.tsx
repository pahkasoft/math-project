import * as React from "react";
import { Dropdown } from "react-bootstrap";
import { Parser } from "math-lib";
import { FractionIcon, ExponentIcon, RadicalIcon, MatrixIcon, AppMenuIcon } from "./icons";
import { SimpleDropDown } from "./components";
import { MathApp } from "math-app";
import { Settings } from "settings";
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
    new SimpleMenuItem(Parser.Vocabulary.opPlus, "a + b"),
    new SimpleMenuItem(Parser.Vocabulary.opMinus, "a − b"),
    new SimpleMenuItem(Parser.Vocabulary.opMultiply, "a · b"),
    new SimpleMenuItem(Parser.Vocabulary.opCrossProd, "A ⨯ B"),
    new SimpleMenuItem(Parser.Vocabulary.opDivide, "a ÷ b"),
    new SimpleMenuItem(Parser.Vocabulary.opModulo, "a % b"),
    new SimpleMenuItem("(", "(a)"),
    new SimpleMenuItem(Parser.Vocabulary.frac, <FractionIcon a="a" b="b" />),
    new SimpleMenuItem(Parser.Vocabulary.opFactorial, "a! or a!!"),
    new SimpleMenuItem(Parser.Vocabulary.opPower, <ExponentIcon a="a" b="b" />),
    new SimpleMenuItem(Parser.Vocabulary.opTranspose, <ExponentIcon a="A" b="T" />),
    new SimpleMenuItem(Parser.Vocabulary.opDeclare, "a := b"),
];

const FunctionMenuItems: SimpleMenuItem[] = [
    new SimpleMenuItem(Parser.Vocabulary.ans, Parser.Vocabulary.ans + "(line)"),
    new SimpleMenuItem(Parser.Vocabulary.abs, Parser.Vocabulary.abs + " |x|"),
    new SimpleMenuItem(Parser.Vocabulary.sgn, Parser.Vocabulary.sgn + "(x)"),
    new SimpleMenuItem(Parser.Vocabulary.sqrt, <span>{Parser.Vocabulary.sqrt} <RadicalIcon y="" /></span>),
    new SimpleMenuItem(Parser.Vocabulary.nthroot, <span>{Parser.Vocabulary.nthroot} <RadicalIcon /></span>),
    new SimpleMenuItem(Parser.Vocabulary.log, <span>log<sub>b</sub>(x)</span>),
    new SimpleMenuItem(Parser.Vocabulary.ln, Parser.Vocabulary.ln + "(x)"),
    new SimpleMenuItem(Parser.Vocabulary.exp, Parser.Vocabulary.exp + "(x)"),
    new SimpleMenuItem(Parser.Vocabulary.sin, Parser.Vocabulary.sin + "(x)"),
    new SimpleMenuItem(Parser.Vocabulary.cos, Parser.Vocabulary.cos + "(x)"),
    new SimpleMenuItem(Parser.Vocabulary.tan, Parser.Vocabulary.tan + "(x)"),
    new SimpleMenuItem(Parser.Vocabulary.asin, Parser.Vocabulary.asin + "(x)"),
    new SimpleMenuItem(Parser.Vocabulary.acos, Parser.Vocabulary.acos + "(x)"),
    new SimpleMenuItem(Parser.Vocabulary.atan, Parser.Vocabulary.atan + "([y,] x)"),
    new SimpleMenuItem(Parser.Vocabulary.sinh, Parser.Vocabulary.sinh + "(x)"),
    new SimpleMenuItem(Parser.Vocabulary.cosh, Parser.Vocabulary.cosh + "(x)"),
    new SimpleMenuItem(Parser.Vocabulary.tanh, Parser.Vocabulary.tanh + "(x)"),
    new SimpleMenuItem(Parser.Vocabulary.asinh, Parser.Vocabulary.asinh + "(x)"),
    new SimpleMenuItem(Parser.Vocabulary.acosh, Parser.Vocabulary.acosh + "(x)"),
    new SimpleMenuItem(Parser.Vocabulary.atanh, Parser.Vocabulary.atanh + "(x)"),
    new SimpleMenuItem(Parser.Vocabulary.gcd, Parser.Vocabulary.gcd + "(n₁, n₂, ...)"),
    new SimpleMenuItem(Parser.Vocabulary.lcm, Parser.Vocabulary.lcm + "(n₁, n₂, ...)"),
    new SimpleMenuItem(Parser.Vocabulary.permutation, "permutation(n, r)"),
    new SimpleMenuItem(Parser.Vocabulary.combination, "combination(n, r)"),
    new SimpleMenuItem(Parser.Vocabulary.summation, Parser.Vocabulary.summation + " Σ"),
    new SimpleMenuItem(Parser.Vocabulary.product, Parser.Vocabulary.product + " Π"),
    new SimpleMenuItem(Parser.Vocabulary.transpose, Parser.Vocabulary.transpose + "(M)"),
    new SimpleMenuItem(Parser.Vocabulary.det, Parser.Vocabulary.det + "(M)"),
    new SimpleMenuItem(Parser.Vocabulary.min, Parser.Vocabulary.min + "(x₁, ...)"),
    new SimpleMenuItem(Parser.Vocabulary.max, Parser.Vocabulary.max + "(x₁, ...)"),
    new SimpleMenuItem(Parser.Vocabulary.clamp, Parser.Vocabulary.clamp + "(x, lo, hi)"),
    new SimpleMenuItem(Parser.Vocabulary.rnd, Parser.Vocabulary.rnd + "([lo,] hi)"),
    new SimpleMenuItem(Parser.Vocabulary.rndint, Parser.Vocabulary.rndint + "([lo,] hi)"),
    new SimpleMenuItem(Parser.Vocabulary.trunc, Parser.Vocabulary.trunc + "(x)"),
    new SimpleMenuItem(Parser.Vocabulary.round, Parser.Vocabulary.round + "(x [, dp])"),
    new SimpleMenuItem(Parser.Vocabulary.floor, Parser.Vocabulary.floor + " ⌊x⌋"),
    new SimpleMenuItem(Parser.Vocabulary.ceil, Parser.Vocabulary.ceil + " ⌈x⌉"),
].sort();

const SymbolMenuItems: SimpleMenuItem[] = [
    new SimpleMenuItem(Parser.Vocabulary.ans),
    new SimpleMenuItem("pi"),
    new SimpleMenuItem("e"),
    new SimpleMenuItem(Parser.Vocabulary.infinity),
    new SimpleMenuItem("inf"),
].sort();

interface AppMenuProps {
    app: MathApp
}

export const AppMenu = (props: AppMenuProps) => {
    let { app } = props;
    let { showBaseConverter } = app.state;

    const toggleBaseConverter = () => app.setShowBaseConverter(!showBaseConverter);

    return (
        <SimpleDropDown button={<AppMenuIcon />} headerTitle="App Menu">
            <Dropdown.Item onClick={() => app.clearWorkspace()}>Clear Workspace</Dropdown.Item>
            {Settings.EnableBaseConverter
                ? <>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={toggleBaseConverter}>
                        {showBaseConverter ? "Hide Base Converter" : "Show Base Converter"}
                    </Dropdown.Item>
                </>
                : null}
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
