import { MathObject } from "./math-object";
import { Assert, Device, Utils, AnchoredRect } from "@tspro/ts-utils-lib";
import { Drawable } from "./drawable";
import { ExpressionPath } from "./expression-path";
import * as Eval from "@tspro/math-lib/eval";
import { Vocabulary, BracketSymbol, Grammar } from "@tspro/math-lib/parser";
import { BigNumber } from "@tspro/math-lib/bigmath";
import Fmt from "@tspro/brace-format";

/*
NNode
    + NText
        + NSpace
        + NSymbol // for numbers and symbols
        + NOperator
            + NTermOp
            + NFactorOp
        + NEqual
        + NDeclare
        + NComma
    + NExpression
    + NPrimaryOp
        + NFactorial
        + NTranspose
        + NExponent
    + NDecoratedFunction
        + NFraction
        + NBracketBase
            + NBrackets
            + NAbs
            + NFloor
            + NCeil
        + NLogarithm
        + NRadical
        + NSeries
    + NMatrix
    + NCalculation
*/

function getPadding() {
    return Device.FontSize / 10;
}

export namespace Nodes {

    const SPACE = " ";
    const NO_BREAK_SPACE = "\u00A0";
    const BALLOT_SYMBOL = "□";

    function nodeRelease(n: Nodes.NNode | undefined) {
        if (n) { n.parent = undefined; }
    }

    function nodeAssign(n: Nodes.NNode | undefined, p: Nodes.NNode) {
        if (n) { n.parent = p; }
    }

    export function createDecoratedFunction(name: string, args: Nodes.NExpression[] = []): NDecoratedFunction | undefined {
        switch (name) {
            case Vocabulary.abs: {
                Assert.in_group(args.length, [0, 1]);
                return new Nodes.NAbs().setArgs(...args);
            }
            case Vocabulary.floor: {
                Assert.in_group(args.length, [0, 1]);
                return new Nodes.NFloor().setArgs(...args);
            }
            case Vocabulary.ceil: {
                Assert.in_group(args.length, [0, 1]);
                return new Nodes.NCeil().setArgs(...args);
            }
            case Vocabulary.frac: {
                Assert.in_group(args.length, [0, 2, 3]);
                return new Nodes.NFraction().setArgs(...args);
            }
            case Vocabulary.sqrt: {
                Assert.in_group(args.length, [0, 1]);
                return new Nodes.NRadical(true).setArgs(...args);
            }
            case Vocabulary.nthroot: {
                Assert.in_group(args.length, [0, 2]);
                return new Nodes.NRadical(false).setArgs(...args);
            }
            case Vocabulary.log: {
                Assert.in_group(args.length, [0, 2]);
                return new Nodes.NLogarithm().setArgs(...args);
            }
            case Vocabulary.summation: {
                Assert.in_group(args.length, [0, 4]);
                return new Nodes.NSummation().setArgs(...args);
            }
            case Vocabulary.product: {
                Assert.in_group(args.length, [0, 4]);
                return new Nodes.NProduct().setArgs(...args);
            }
            default:
                return undefined;
        }
    }

    export abstract class NNode {
        private _mathObject?: MathObject;
        private _parent?: NNode;
        protected _needUpdate = true;

        public readonly bounds = new AnchoredRect();

        constructor(public readonly className: string) {
        }

        get mathObject(): MathObject | undefined {
            return this._mathObject;
        }

        set mathObject(obj: MathObject | undefined) {
            this._mathObject = obj;
            this.getNodeList().forEach(n => n.mathObject = obj);
            this.getDrawableList().forEach(d => d.mathObject = obj);
        }

        get parent(): NNode | undefined {
            return this._parent;
        }

        get parentExpression(): NExpression | undefined {
            return this.parent instanceof NExpression ? this.parent : undefined;
        }

        set parent(p: NNode | undefined) {
            this._parent = p;
            this.mathObject = p ? p.mathObject : undefined;
        }

        protected notifyChanged() {
            if (!this._needUpdate) {
                this._needUpdate = true;
                this.forEachNode(n => n.notifyChanged());
            }
            if (this.mathObject) {
                this.mathObject.requestUpdate();
            }
        }

        getNodeAt(x: number, y: number): NNode | undefined {
            let nodes = this.getNodeList();
            if (this.bounds.contains(x, y)) {
                for (let i = 0, n = this.getNodeList.length; i < n; i++) {
                    let node = nodes[i].getNodeAt(x, y);
                    if (node) {
                        return node;
                    }
                }
                return this;
            }
            return undefined;
        }

        getNodeList(): NNode[] {
            return [];
        }

        protected getDrawableList(): Drawable.Drawable[] {
            return [];
        }

        forEachNode(callbackfn: (n: NNode) => void) {
            this.getNodeList().forEach(callbackfn);
        }

        forEachDrawable(callbackfn: (d: Drawable.Drawable) => void) {
            this.getDrawableList().forEach(callbackfn);
            this.forEachNode(n => n.forEachDrawable(callbackfn));
        }

        forEachDrawableElem(callbackfn: (e: HTMLElement) => void) {
            this.forEachDrawable(d => callbackfn(d.elem));
            this.forEachNode(n => n.forEachDrawableElem(callbackfn));
        }

        offset(x: number, y: number) {
            this.getDrawableList().forEach(d => d.offset(x, y));
            this.getNodeList().forEach(n => n.offset(x, y));
            this.bounds.offsetInPlace(x, y);
        }

        abstract layout(): AnchoredRect;

        layoutScaledDown(): AnchoredRect {
            if (this.mathObject) {
                this.mathObject.scaleDown();
                let r = this.layout();
                this.mathObject.scaleUp();
                return r;
            }
            else {
                return this.layout();
            }
        }

        gatherPath(path: ExpressionPath.Slot[]) {
            this.getNodeList().forEach(n => n.gatherPath(path));
        }

        addTo(expr: NExpression | undefined) {
            if (expr) { expr.addNodes(this); }
            return this;
        }

        formatString(fnName: string, br: "()" | "{}", ...args: (NNode | string)[]): string {
            return fnName + args.map(arg => br.charAt(0) + arg.toString() + br.charAt(1)).join("");
        }

        abstract toString(): string;

        public isEvaluable() { return this.taskIsEvaluable(); }
        public evaluate(state: Eval.EvalState) { return this.taskEvaluate(state); }

        /** Override these */
        protected taskIsEvaluable() {
            return false;
        }
        protected taskInitialize(state: Eval.EvalState): Promise<number> {
            // Override to get step count
            Assert.interrupt("Override!");
        }
        protected taskDoStep(stepIndex: number, state: Eval.EvalState): Promise<Eval.EvalValue> {
            Assert.interrupt("Override!");
        }

        private taskEvaluate(state: Eval.EvalState) {
            return new Promise<Eval.EvalValue>((resolve, reject) => {
                if (this.isEvaluable() === false) {
                    reject(Eval.EvalError.SyntaxError(state, Eval.EvalErrorCode.InadequateExpression));
                    return;
                }
                this.taskInitialize(state).
                    then(stepCount => {
                        if (Utils.Math.isInteger(stepCount) && stepCount >= 0) {
                            resolve(this._step(0, stepCount, state))
                        }
                        else {
                            reject(Eval.EvalError.MathError(state));
                        }

                    }).
                    catch(err => reject(err));
            });
        }

        private _step(stepIndex: number, stepCount: number, state: Eval.EvalState) {
            return new Promise<Eval.EvalValue>((resolve, reject) => {
                this.taskDoStep(stepIndex, state).
                    then(value => {
                        if (state.isInterruptRequested()) {
                            reject(new Eval.EvalInterrupted());
                        }
                        else if (stepIndex === stepCount - 1) {
                            resolve(value);
                        }
                        else if (state.needBreak()) {
                            setTimeout(() => resolve(this._step(stepIndex + 1, stepCount, state)), 0);
                        }
                        else {
                            resolve(this._step(stepIndex + 1, stepCount, state));
                        }
                    }).catch(err => reject(err));
            });
        }

    }

    export abstract class NText extends NNode {
        protected _text: string = "";
        private drawableText: Drawable.Text = new Drawable.Text(this, Drawable.ThemeStyle.Default);

        constructor(className: string, initValue: string) {
            super(className);
            this.text(initValue);
        }

        validate(str: string): boolean {
            return false;
        }

        getPaddingFactor() { return 0; }
        get padding() { return getPadding() * this.getPaddingFactor(); }

        text(text?: string): string {
            if (text !== undefined) {
                Assert.int_gt(text.length, 0, "Text length.");
                Assert.assert(this.validate(text), Fmt.format("Validating \"{}\".", text));

                this._text = text;

                let displayStr = this.toDisplayString();
                this.drawableText.setText(displayStr);

                this.notifyChanged();
            }
            return this._text;
        }

        toString(): string {
            return this._text;
        }

        toDisplayString(): string {
            return this._text;
        }

        protected getDrawableList(): Drawable.Drawable[] {
            return [this.drawableText];
        }

        layout() {
            if (!this._needUpdate) {
                return this.bounds;
            }

            let p = this.padding;
            let r = this.drawableText.layout();

            r.offsetInPlace(p, 0);

            let w = p + r.width + p;
            this.bounds.set(0, w / 2, w, 0, r.toph, r.height);

            return this.bounds;
        }
    }

    export class NSpace extends NText {
        constructor() {
            super("NSpace", NO_BREAK_SPACE);
        }

        validate(str: string): boolean {
            return str === NO_BREAK_SPACE;
        }

        toDisplayString(): string {
            return NO_BREAK_SPACE;
        }

        toString(): string {
            return SPACE;
        }
    }

    export class NSymbol extends NText {
        constructor(str: string) {
            super("NSymbol", str);
        }

        validate(str: string): boolean {
            return str.length === 1 && Grammar.testRule(str, Grammar.Rules.SYMBOL_SEQUENCE);
        }
    }

    export abstract class NOperator extends NText {
        constructor(className: string, str: string) {
            super(className, str);
        }
    }

    export class NTermOp extends NOperator {
        constructor(str: string) {
            super("NTermOp", str);
        }

        isAdd(): boolean {
            return Grammar.testRule(this.toString(), Grammar.Rules.ADD);
        }

        isSubtract(): boolean {
            return Grammar.testRule(this.toString(), Grammar.Rules.SUBTRACT);
        }

        validate(str: string): boolean {
            return Grammar.testRule(str, Grammar.Rules.ADD, Grammar.Rules.SUBTRACT);
        }

        getPaddingFactor() {
            return 1;
        }

        toDisplayString(): string {
            return this.toString().replace("-", "−");
        }
    }

    export class NFactorOp extends NOperator {
        constructor(str: string) {
            super("NFactorOp", str);
        }

        isMultiply(): boolean {
            return Grammar.testRule(this.toString(), Grammar.Rules.MULTIPLY);
        }

        isDivide(): boolean {
            return Grammar.testRule(this.toString(), Grammar.Rules.DIVIDE);
        }

        isModulo(): boolean {
            return Grammar.testRule(this.toString(), Grammar.Rules.MODULO);
        }

        isCrossProduct(): boolean {
            return Grammar.testRule(this.toString(), Grammar.Rules.CROSS_PRODUCT);
        }

        validate(str: string): boolean {
            return Grammar.testRule(str, Grammar.Rules.MULTIPLY, Grammar.Rules.DIVIDE, Grammar.Rules.MODULO, Grammar.Rules.CROSS_PRODUCT);
        }

        getPaddingFactor() {
            return 1;
        }

        toDisplayString(): string {
            return this.toString().replace("*", "·").replace("/", "÷");
        }
    }

    export class NDeclare extends NText {
        constructor() {
            super("NDeclare", Vocabulary.opDeclare);
        }

        getPaddingFactor() {
            return 2;
        }

        validate(str: string): boolean {
            return str === Vocabulary.opDeclare;
        }
    }

    export type EqualSymbol = "=" | "≈";

    export function isEqualSymbol(sym: string): sym is EqualSymbol {
        return sym === "=" || sym === "≈";
    }

    export class NEqual extends NText {
        constructor(sym: EqualSymbol = "=") {
            super("NEqual", sym);
        }

        getPaddingFactor() {
            return 2;
        }

        validate(str: string): boolean {
            return isEqualSymbol(str);
        }
    }

    export class NComma extends NText {
        constructor() {
            super("NComma", ",");
        }

        validate(str: string): boolean {
            return str === ",";
        }

        toDisplayString(): string {
            return "," + NO_BREAK_SPACE;
        }
    }

    export class NExpression extends NNode {
        private drawableBallot: Drawable.Text;
        private arr: NNode[] = [];

        constructor(...nodes: NNode[]) {
            super("NExpression");

            this.drawableBallot = new Drawable.Text(this, Drawable.ThemeStyle.Default, BALLOT_SYMBOL);
            this.drawableBallot.visible = false;

            this.addNodes(...nodes);
        }

        getNodeList(): NNode[] {
            return this.arr;
        }

        protected getDrawableList(): Drawable.Drawable[] {
            return [this.drawableBallot];
        }

        nodeCount() {
            return this.arr.length;
        }

        isEmpty() {
            return this.nodeCount() === 0;
        }

        forEachNode(cb: (n: NNode) => void) {
            this.getNodeList().forEach(n => cb(n));
        }

        getNode(index: number) {
            return Assert.array_elem(this.arr, index, "NExpression.getNode()");
        }

        indexOf(node: NNode): number {
            return this.arr.indexOf(node);
        }

        insertNodes(index: number, ...nodes: NNode[]) {
            return this.splice(index, 0, ...nodes);
        }

        addNodes(...nodes: NNode[]) {
            return this.splice(this.nodeCount(), 0, ...nodes)
        }

        removeNode(arg: NNode | number) {
            let index: number;

            if (arg instanceof NNode) {
                index = this.arr.indexOf(arg);
            }
            else {
                index = arg;
            }

            Assert.int(index, "removeNode");

            return this.splice(index, 1);
        }

        removeNodeRange(start: number, end?: number): NNode[] {
            if (end === undefined) {
                end = this.arr.length;
            }

            Assert.int(start);
            Assert.int(end);

            return this.splice(start, end - start);
        }

        removeAllNodes() {
            return this.splice(0, this.nodeCount());
        }

        replaceNode(node: NNode, replaceWith: NNode | NNode[]) {
            let index = this.indexOf(node);

            if (replaceWith instanceof NNode) {
                replaceWith = [replaceWith];
            }

            return this.splice(index, 1, ...replaceWith);
        }

        slice(start?: number, end?: number): NNode[] {
            return this.arr.slice(start, end);
        }

        splice(index: number, removeCount: number, ...addNodes: NNode[]) {
            Assert.int_gte(index, 0);
            Assert.int_gte(removeCount, 0);
            Assert.int_lte(index + removeCount, this.arr.length);
            Assert.assert(addNodes.every(n => n instanceof NNode));

            addNodes.forEach(n => {
                Assert.require(n);
                Assert.assert(!n.parent || n.parent === n.parentExpression);
                if (n.parentExpression) {
                    n.parentExpression.removeNode(n);
                }
            });

            let removedNodes = this.arr.splice(index, removeCount, ...addNodes);

            removedNodes.forEach(n => nodeRelease(n));
            addNodes.forEach(n => nodeAssign(n, this));

            this.notifyChanged();
            this.needUpdateEvaluatorList = true;

            return removedNodes;
        }

        private updateSymbolStyle() {
            for (let i = 0, n = this.nodeCount(); i < n;) {
                let node = this.getNode(i++);
                if (node instanceof NSymbol) {
                    let nodeList: NNode[] = [node];

                    for (; i < n && (node = this.getNode(i)) instanceof NSymbol; i++) {
                        nodeList.push(node);
                    }

                    let isFunction = i < n && (node = this.getNode(i)) instanceof NBracket;

                    let valueStr = nodeList.map(n => n.toString()).join("");

                    if (Grammar.isNumber(valueStr)) {
                        nodeList.forEach(n => n.forEachDrawable(d => d.setStyle(Drawable.ThemeStyle.Number)));
                    }
                    else if (isFunction) {
                        nodeList.forEach(n => n.forEachDrawable(d => d.setStyle(Drawable.ThemeStyle.Function)));
                    }
                    else {
                        nodeList.forEach(n => n.forEachDrawable(d => d.setStyle(Drawable.ThemeStyle.Variable)));
                    }
                }
            }
        }

        private prepareExponents() {
            // For prev node for primary operators (exponents)
            let prevNode: NNode | undefined = undefined;
            this.getNodeList().forEach(node => {
                if (node instanceof NPrimaryOp) {
                    node.setPrevNode(prevNode);
                }
                prevNode = node;
            })
        }

        layout() {
            if (!this._needUpdate) {
                return this.bounds;
            }

            this.updateSymbolStyle();
            this.prepareExponents();

            if (this.nodeCount() === 0) {
                let visible = this.drawableBallot.visible = !(this.parent instanceof NCalculation || this.parent instanceof NBracket);
                let r = this.drawableBallot.layout();
                let w = visible ? r.width : 0;
                return this.bounds.set(0, w / 2, w, 0, r.toph, r.height);
            }
            else {
                this.drawableBallot.visible = false;
                this.drawableBallot.layout();

                let x = 0, width = 0, toph = 0, bottomh = 0;

                this.forEachNode(n => {
                    let r = n.layout();
                    toph = Math.max(toph, r.toph);
                    bottomh = Math.max(bottomh, r.bottomh);
                    width += r.width;
                });

                this.forEachNode(n => {
                    n.offset(x, toph - n.bounds.toph);
                    x += n.bounds.width;
                });

                return this.bounds.set(0, width / 2, width, 0, toph, toph + bottomh);

            }
        }

        private evaluatorList: Eval.ExpressionEvaluator[] = [];
        private needUpdateEvaluatorList = true;

        private updateEvaluatorList() {
            if (!this.needUpdateEvaluatorList) {
                return;
            }

            this.evaluatorList = [];

            // Split expression by comma to evaluator list
            let nodeList: Nodes.NNode[] = [];

            const pushEvaluator = () => {
                this.evaluatorList.push(new Eval.ExpressionEvaluator(this, nodeList));
                nodeList = [];
            }

            for (let i = 0, n = this.nodeCount(); i < n; i++) {
                let n = this.getNode(i);
                if (n instanceof Nodes.NComma) {
                    pushEvaluator();
                }
                else {
                    nodeList.push(n);
                }
            }

            pushEvaluator();

            this.needUpdateEvaluatorList = false;
        }

        public executeList(state: Eval.EvalState, saveResult: boolean) {
            return new Promise<Eval.EvalDeclValue[]>((resolve, reject) => {
                this.updateEvaluatorList();

                let n = this.evaluatorList.length;
                let valueList: Eval.EvalDeclValue[] = [];

                const executeIndex = (i: number) => {
                    if (i === n) {
                        resolve(valueList);
                    }
                    else {
                        this.evaluatorList[i].execute(state).
                            then(value => {
                                valueList[i] = value;

                                if (saveResult) {
                                    state.saveDeclaration(value);

                                    if (n === 1) {
                                        state.saveAns(value);
                                    }
                                }

                                executeIndex(i + 1);
                            }).
                            catch(err => reject(err));
                    }
                }

                executeIndex(0);
            });
        }

        isEvaluable() { return true; }
        public evaluate(state: Eval.EvalState) {
            return new Promise<Eval.EvalValue>((resolve, reject) => {
                this.executeList(state, false).
                    then(valueList => resolve(Eval.requireSingleEvalValue(valueList, state))).
                    catch(err => reject(err));
            });
        }

        toString() {
            return this.arr.map(n => n.toString()).join("");
        }

        gatherPath(path: ExpressionPath.Slot[]) {
            const onSlot = (expr: NExpression, leftBlock?: ExpressionPath.Block, rightBlock?: ExpressionPath.Block) => {
                path.push(new ExpressionPath.Slot(expr, leftBlock, rightBlock));
            }

            let blocks: ExpressionPath.Block[] = [];

            this.arr.forEach(node => {
                blocks.push(new ExpressionPath.Block(node));
            });

            for (let i = 0; i <= blocks.length; i++) {
                onSlot(this, blocks[i - 1], blocks[i]);
                blocks[i]?.node?.gatherPath(path);
            }
        }

        insertAfter(afterWhat: NNode, insertWhat: NNode) {
            Assert.assert(afterWhat.parent === this);

            let index = this.indexOf(afterWhat);
            Assert.int_gte(index, 0);

            this.insertNodes(index + 1, insertWhat);
        }

        insertBefore(beforeWhat: NNode, insertWhat: NNode) {
            Assert.assert(beforeWhat.parent === this);

            let index = this.indexOf(beforeWhat);
            Assert.int_gte(index, 0);

            this.insertNodes(index, insertWhat);
        }

    }

    export abstract class NPrimaryOp extends NNode {
        drawableBallot: Drawable.Text;
        prevNode?: NNode;

        constructor(className: string, protected readonly superscript: boolean, private readonly scaleDownElem: boolean) {
            super(className);
            this.drawableBallot = new Drawable.Text(this, Drawable.ThemeStyle.Default);
        }

        getNodeList(): NNode[] {
            let e = this.getElement();
            return e instanceof NExpression ? [e] : [];
        }

        protected getDrawableList(): Drawable.Drawable[] {
            let e = this.getElement();
            return e instanceof Drawable.Text ? [this.drawableBallot, e] : [this.drawableBallot];
        }

        abstract getElement(): NExpression | Drawable.Text;

        setPrevNode(n: NNode | undefined) {
            this.prevNode = n;
        }

        layout() {
            if (!this._needUpdate) {
                return this.bounds;
            }

            this.drawableBallot.setText(this.superscript && !this.prevNode ? BALLOT_SYMBOL : "");

            let elem = this.getElement();
            let elemR: AnchoredRect;

            if (this.scaleDownElem) {
                elemR = elem.layoutScaledDown();
            }
            else if (elem instanceof NExpression) {
                elemR = elem.layout();
            }
            else {
                elemR = elem.layout();
            }

            let font = this.mathObject ? this.mathObject.getFont() : Drawable.Font.getFont();

            let ballotR = this.drawableBallot.layout();
            let prevR = this.prevNode ? this.prevNode.bounds : ballotR;

            let width = ballotR.width + elemR.width;
            let toph, bottomh;

            if (this.superscript) {
                toph = prevR.toph + elemR.height - font.size / 2;
                bottomh = prevR.bottomh;
            }
            else {
                toph = elemR.toph;
                bottomh = elemR.bottomh;
            }

            this.drawableBallot.offset(0, toph + bottomh - ballotR.height);
            elem.offset(ballotR.width, 0);

            this.bounds.set(0, width / 2, width, 0, toph, toph + bottomh);

            return this.bounds;
        }
    }

    export class NExponent extends NPrimaryOp {
        exponentNode!: NExpression;

        constructor(exp?: NExpression) {
            super("NExponent", true, true);
            this.setExponent(exp);
        }

        setExponent(exp?: NExpression) {
            nodeRelease(this.exponentNode);
            this.exponentNode = exp ?? new NExpression();
            nodeAssign(this.exponentNode, this);

            this.notifyChanged();
        }

        getElement() {
            return this.exponentNode;
        }

        getExponent(): NExpression {
            return this.exponentNode;
        }

        toString(): string {
            let exp = this.getExponent();
            if (exp.nodeCount() === 1 && exp.getNode(0) instanceof NBracket) {
                return Vocabulary.opPower + exp.toString();
            }
            else {
                return Vocabulary.opPower + "{" + exp.toString() + "}";
            }
        }
    }

    export class NTranspose extends NPrimaryOp {
        drawableTranspSymbol: Drawable.Text;

        constructor() {
            super("NTranspose", true, false);
            this.drawableTranspSymbol = new Drawable.Text(this, Drawable.ThemeStyle.Operator, "T");
        }

        getElement() {
            return this.drawableTranspSymbol;
        }

        toString(): string {
            return Vocabulary.opTranspose;
        }
    }

    export class NFactorial extends NPrimaryOp {
        drawableExclamationMark: Drawable.Text;

        constructor() {
            super("NFactorial", false, false);
            this.drawableExclamationMark = new Drawable.Text(this, Drawable.ThemeStyle.Operator, "!");
        }

        getElement() {
            return this.drawableExclamationMark;
        }

        toString(): string {
            return "!";
        }
    }

    export abstract class NDecoratedFunction extends NNode {
        constructor(className: string) {
            super(className);
        }
    }

    export class NLogarithm extends NDecoratedFunction {
        private drawableText: Drawable.Text;
        private drawableLeftBracket: Drawable.Bracket;
        private drawableRightBracket: Drawable.Bracket;
        private baseExpr!: NExpression;
        private argExpr!: NExpression;

        constructor() {
            super("NLogarithm");

            this.drawableText = new Drawable.Text(this, Drawable.ThemeStyle.Function, "log");
            this.drawableLeftBracket = new Drawable.Bracket(this, Drawable.ThemeStyle.Decoration, BracketSymbol.LeftBracket);
            this.drawableRightBracket = new Drawable.Bracket(this, Drawable.ThemeStyle.Decoration, BracketSymbol.RightBracket);

            this.setArgs();
        }

        setArgs(base?: NExpression, arg?: NExpression) {
            nodeRelease(this.baseExpr);
            nodeRelease(this.argExpr);

            this.baseExpr = base ?? new NExpression();
            this.argExpr = arg ?? new NExpression();

            nodeAssign(this.baseExpr, this);
            nodeAssign(this.argExpr, this);

            this.notifyChanged();

            return this;
        }

        getNodeList(): NNode[] {
            return [this.baseExpr, this.argExpr];
        }

        protected getDrawableList(): Drawable.Drawable[] {
            return [this.drawableText, this.drawableLeftBracket, this.drawableRightBracket];
        }

        layout() {
            if (!this._needUpdate) {
                return this.bounds;
            }

            let argR = this.argExpr.layout();

            let baseR = this.baseExpr ? this.baseExpr.layoutScaledDown() : undefined;

            let nameR = this.drawableText.layout();
            let leftBrR = this.drawableLeftBracket.layout(argR.height);
            let rightBrR = this.drawableRightBracket.layout(argR.height);

            let width = nameR.width;
            let toph = nameR.toph;
            let bottomh = nameR.bottomh;

            width += leftBrR.width + argR.width + rightBrR.width;
            toph = Math.max(toph, argR.toph);
            bottomh = Math.max(bottomh, argR.bottomh);

            let baseW = baseR ? baseR.width : 0;

            width += baseW;
            bottomh = Math.max(bottomh, baseR ? baseR.height : 0);

            this.drawableText.offset(0, argR.toph - nameR.toph);
            this.drawableLeftBracket.offset(nameR.width + baseW, 0);
            this.argExpr.offset(nameR.width + baseW + leftBrR.width, 0);
            this.drawableRightBracket.offset(nameR.width + baseW + leftBrR.width + argR.width, 0);
            this.baseExpr.offset(nameR.width, toph);

            this.bounds.set(0, width / 2, width, 0, toph, toph + bottomh);

            return this.bounds;
        }

        taskIsEvaluable() { return true; }
        taskInitialize() { return Promise.resolve(1); }
        taskDoStep(stepIndex: number, state: Eval.EvalState) {
            return new Promise<Eval.EvalValue>((resolve, reject) => {
                this.baseExpr.evaluate(state).then(value => {
                    let base = value;
                    this.argExpr.evaluate(state).then(value => {
                        let arg = value;
                        resolve(Eval.fnLog([base, arg], state));
                    }).catch(err => reject(err));
                }).catch(err => reject(err));
            });
        }

        toString(): string {
            return this.formatString(Vocabulary.log, "{}", this.baseExpr, this.argExpr);
        }
    }

    export class NFraction extends NDecoratedFunction {
        private drawableFractionLine: Drawable.FractionLine;
        private wholeExpr?: NExpression;
        private numeratorExpr!: NExpression;
        private denominatorExpr!: NExpression;

        constructor() {
            super("NFraction");

            this.drawableFractionLine = new Drawable.FractionLine(this, Drawable.ThemeStyle.Decoration);

            this.setArgs();
        }

        setArgs(...args: NExpression[]): NFraction {
            nodeRelease(this.wholeExpr);
            nodeRelease(this.numeratorExpr);
            nodeRelease(this.denominatorExpr);
            if (args.length > 0) {
                Assert.in_group(args.length, [2, 3]);
                this.wholeExpr = args.length === 3 ? args[0] : undefined;
                this.numeratorExpr = args.length === 3 ? args[1] : args[0];
                this.denominatorExpr = args.length === 3 ? args[2] : args[1];
            }
            else {
                this.wholeExpr = undefined;
                this.numeratorExpr = new NExpression();
                this.denominatorExpr = new NExpression();
            }
            nodeAssign(this.wholeExpr, this);
            nodeAssign(this.numeratorExpr, this);
            nodeAssign(this.denominatorExpr, this);

            this.notifyChanged();

            return this;
        }

        getNodeList(): NNode[] {
            if (this.wholeExpr) {
                return [this.wholeExpr, this.numeratorExpr, this.denominatorExpr];
            }
            else {
                return [this.numeratorExpr, this.denominatorExpr];
            }
        }

        protected getDrawableList(): Drawable.Drawable[] {
            return [this.drawableFractionLine];
        }

        layout() {
            if (!this._needUpdate) {
                return this.bounds;
            }

            let p = getPadding();

            let kokR = this.wholeExpr ? this.wholeExpr.layout() : new AnchoredRect();
            let osoR = this.numeratorExpr.layout();
            let nimR = this.denominatorExpr.layout();

            let fwidth = Math.max(osoR.width, nimR.width);
            let toph = Math.max(kokR.toph, osoR.height);
            let bottomh = Math.max(kokR.bottomh, nimR.height);

            let w = p + kokR.width + 2 * p + fwidth + 2 * p;
            this.bounds.set(0, w / 2, w, 0, toph + p, toph + bottomh + 2 * p);

            this.wholeExpr && this.wholeExpr.offset(p, p + toph - kokR.toph);

            this.numeratorExpr.offset(p + kokR.width + 2 * p + fwidth / 2 - osoR.width / 2, 0);
            this.denominatorExpr.offset(p + kokR.width + 2 * p + fwidth / 2 - nimR.width / 2, toph + 2 * p);

            this.drawableFractionLine.layout(p + fwidth + p, toph, bottomh);
            this.drawableFractionLine.offset(p + kokR.width + p, p);

            return this.bounds;
        }

        taskIsEvaluable() { return true; }
        taskInitialize() { return Promise.resolve(1); }
        taskDoStep(stepIndex: number, state: Eval.EvalState) {
            return new Promise<Eval.EvalValue>((resolve, reject) => {
                this.numeratorExpr.evaluate(state).then(value => {
                    let numer = value;
                    this.denominatorExpr.evaluate(state).then(value => {
                        let denom = value;
                        resolve(Eval.fnFrac(numer, denom, state));
                    }).catch(err => reject(err));
                }).catch(err => reject(err));
            });
        }

        toString(): string {
            return this.formatString(Vocabulary.frac, "{}", this.numeratorExpr, this.denominatorExpr);
        }
    }

    export abstract class NBracketBase extends NDecoratedFunction {
        private drawableLeftBracket: Drawable.Bracket;
        private drawableRightBracket: Drawable.Bracket;
        private expression!: NExpression;

        constructor(className: string, readonly leftSymbol: BracketSymbol, readonly rightSymbol: BracketSymbol) {
            super(className);

            this.drawableLeftBracket = new Drawable.Bracket(this, Drawable.ThemeStyle.Decoration, leftSymbol);
            this.drawableRightBracket = new Drawable.Bracket(this, Drawable.ThemeStyle.Decoration, rightSymbol);

            this.setArgs();
        }

        setArgs(expr?: NExpression): NBracketBase {
            nodeRelease(this.expression);
            this.expression = expr ?? new NExpression();
            nodeAssign(this.expression, this);

            this.notifyChanged();

            return this;
        }

        getExpression(): NExpression {
            return this.expression;
        }

        getNodeList(): NNode[] {
            return [this.expression];
        }

        protected getDrawableList(): Drawable.Drawable[] {
            return [this.drawableLeftBracket, this.drawableRightBracket];
        }

        layout() {
            if (!this._needUpdate) {
                return this.bounds;
            }

            let r = this.expression.layout();

            let toph = r.toph;
            let bottomh = r.bottomh;

            let lbR = this.drawableLeftBracket.layout(toph + bottomh);
            let rbR = this.drawableRightBracket.layout(toph + bottomh);

            let width = lbR.width + r.width + rbR.width;

            this.bounds.set(0, width / 2, width, 0, toph, toph + bottomh);

            this.drawableLeftBracket.offset(0, 0);
            this.expression.offset(lbR.width, 0);
            this.drawableRightBracket.offset(lbR.width + r.width, 0);

            return this.bounds;
        }

        toString(): string {
            return this.leftSymbol + this.getExpression().toString() + this.rightSymbol;
        }

        abstract calcValue(value: Eval.EvalValue, state: Eval.EvalState): Eval.EvalValue;

        taskIsEvaluable() { return true; }
        taskInitialize() { return Promise.resolve(1); }
        taskDoStep(stepIndex: number, state: Eval.EvalState) {
            return new Promise<Eval.EvalValue>((resolve, reject) => {
                this.getExpression().evaluate(state).
                    then(value => resolve(this.calcValue(value, state))).
                    catch(err => reject(err));
            });
        }
    }

    export class NBracket extends NBracketBase {
        constructor() {
            super("NBracket", BracketSymbol.LeftBracket, BracketSymbol.RightBracket);
        }

        calcValue(value: Eval.EvalValue, state: Eval.EvalState) {
            return value;
        }
    }

    export class NAbs extends NBracketBase {
        constructor() {
            super("NAbs", BracketSymbol.StraightLine, BracketSymbol.StraightLine);
        }

        calcValue(value: Eval.EvalValue, state: Eval.EvalState) {
            return Eval.fnAbs(value, state)
        }

        toString(): string {
            return this.formatString(Vocabulary.abs, "{}", this.getExpression());
        }
    }

    export class NFloor extends NBracketBase {
        constructor() {
            super("NFloor", BracketSymbol.LeftFloor, BracketSymbol.RightFloor);
        }

        calcValue(value: Eval.EvalValue, state: Eval.EvalState) {
            return Eval.fnFloor(value, state)
        }

        toString(): string {
            return this.formatString(Vocabulary.floor, "{}", this.getExpression());
        }
    }

    export class NCeil extends NBracketBase {
        constructor() {
            super("NCeil", BracketSymbol.LeftCeil, BracketSymbol.RightCeil);
        }

        calcValue(value: Eval.EvalValue, state: Eval.EvalState) {
            return Eval.fnCeil(value, state)
        }

        toString(): string {
            return this.formatString(Vocabulary.ceil, "{}", this.getExpression());
        }
    }

    export class NRadical extends NDecoratedFunction {
        private drawableRadical: Drawable.Radical;
        private indexExpr?: NExpression;
        private argExpr!: NExpression;

        constructor(private isSqrt: boolean) {
            super("NRadical");

            this.drawableRadical = new Drawable.Radical(this, Drawable.ThemeStyle.Decoration);

            this.setArgs();
        }

        setArgs(...args: NExpression[]): NRadical {
            if (this.isSqrt) {
                Assert.in_group(args.length, [0, 1]);
                nodeRelease(this.indexExpr);
                nodeRelease(this.argExpr);
                this.indexExpr = undefined;
                this.argExpr = args[0] ?? new NExpression();
                nodeAssign(this.indexExpr, this);
                nodeAssign(this.argExpr, this);
            }
            else {
                Assert.in_group(args.length, [0, 2]);
                nodeRelease(this.indexExpr);
                nodeRelease(this.argExpr);
                this.indexExpr = args[0] ?? new NExpression();
                this.argExpr = args[1] ?? new NExpression();
                nodeAssign(this.indexExpr, this);
                nodeAssign(this.argExpr, this);
            }

            this.notifyChanged();

            return this;
        }

        getNodeList(): NNode[] {
            return this.indexExpr ? [this.indexExpr, this.argExpr] : [this.argExpr];
        }

        protected getDrawableList(): Drawable.Drawable[] {
            return [this.drawableRadical];
        }

        layout() {
            if (!this._needUpdate) {
                return this.bounds;
            }

            let p = getPadding() * 2;

            let indexR = this.isSqrt ? undefined : Assert.require(this.indexExpr).layoutScaledDown();

            let indW = indexR ? indexR.width : 0;
            let indH = indexR ? indexR.height : 0;

            let argR = this.argExpr.layout();

            let indSpcH = argR.height * 0.4;
            let drop = Math.max(indH - indSpcH, 0);

            this.drawableRadical.layout(argR.width + p, argR.height);
            let radSymW = this.drawableRadical.radicalSymbolWidth;
            let radSymbolX = Math.max(0, indW - radSymW / 2);

            this.drawableRadical.offset(p + radSymbolX, drop);

            this.indexExpr?.offset(p, indSpcH - indH + drop);

            this.argExpr.offset(p + radSymbolX + radSymW, drop);

            let w = p + radSymbolX + radSymW + argR.width + p;
            this.bounds.set(0, w / 2, w, 0, argR.anchorY, argR.bottom);

            return this.bounds;
        }

        taskIsEvaluable() { return true; }
        taskInitialize() { return Promise.resolve(1); }
        taskDoStep(stepIndex: number, state: Eval.EvalState) {
            return new Promise<Eval.EvalValue>((resolve, reject) => {
                this.argExpr.evaluate(state).then(value => {
                    let arg = value;
                    let indexExpr = this.indexExpr;
                    if (indexExpr === undefined) {
                        resolve(Eval.fnSqrt(arg, state));
                    }
                    else {
                        indexExpr.evaluate(state).then(value => {
                            let index = value;
                            resolve(Eval.fnNthRoot(index, arg, state));
                        }).catch(err => reject(err));
                    }
                }).catch(err => reject(err));
            });
        }


        toString(): string {
            if (this.isSqrt) {
                return this.formatString(Vocabulary.sqrt, "{}", this.argExpr);
            }
            else {
                return this.formatString(Vocabulary.nthroot, "{}", Assert.require(this.indexExpr), this.argExpr);
            }
        }
    }

    abstract class NSeries extends NDecoratedFunction {
        private drawableSym: Drawable.Text;
        private drawableEq: Drawable.Text;
        private drawableLeftBracket: Drawable.Bracket;
        private drawableRightBracket: Drawable.Bracket;
        private varExpr!: NExpression;
        private fromExpr!: NExpression;
        private toExpr!: NExpression;
        private fnExpr!: NExpression;

        abstract getName(): string;
        abstract getSymbol(): string;
        abstract seriesOp(a: Eval.EvalValue, b: Eval.EvalValue, s: Eval.EvalState): Eval.EvalValue;

        constructor(className: string) {
            super(className);

            this.drawableSym = new Drawable.Text(this, Drawable.ThemeStyle.Function);
            this.drawableEq = new Drawable.Text(this, Drawable.ThemeStyle.Operator, "=");
            this.drawableLeftBracket = new Drawable.Bracket(this, Drawable.ThemeStyle.Decoration, BracketSymbol.LeftBracket);
            this.drawableRightBracket = new Drawable.Bracket(this, Drawable.ThemeStyle.Decoration, BracketSymbol.RightBracket);

            this.setArgs();
        }

        setArgs(varExpr?: NExpression, fromExpr?: NExpression, toExpr?: NExpression, funcExpr?: NExpression) {
            this.drawableSym.setText(this.getSymbol());

            nodeRelease(this.varExpr);
            nodeRelease(this.fromExpr);
            nodeRelease(this.toExpr);
            nodeRelease(this.fnExpr);

            this.varExpr = varExpr ?? new NExpression();
            this.fromExpr = fromExpr ?? new NExpression();
            this.toExpr = toExpr ?? new NExpression();
            this.fnExpr = funcExpr ?? new NExpression();

            nodeAssign(this.varExpr, this);
            nodeAssign(this.fromExpr, this);
            nodeAssign(this.toExpr, this);
            nodeAssign(this.fnExpr, this);

            this.notifyChanged();

            return this;
        }

        getNodeList(): NNode[] {
            return [this.varExpr, this.fromExpr, this.toExpr, this.fnExpr];
        }

        protected getDrawableList(): Drawable.Drawable[] {
            return [this.drawableSym, this.drawableEq, this.drawableLeftBracket, this.drawableRightBracket];
        }

        layout() {
            if (!this._needUpdate) {
                return this.bounds;
            }

            let p = getPadding();

            let varR = this.varExpr.layout();
            let fromR = this.fromExpr.layout();
            let toR = this.toExpr.layout();
            let fnR = this.fnExpr.layout();
            let symR = this.drawableSym.layout();
            let eqR = this.drawableEq.layout();
            let lbR = this.drawableLeftBracket.layout(fnR.height);
            let rbR = this.drawableRightBracket.layout(fnR.height);

            let uprR = toR;
            let midR = symR;

            let w = varR.width + eqR.width + fromR.width;
            let toph = Math.max(varR.toph, eqR.toph, fromR.toph);
            let bottomh = Math.max(varR.bottomh, eqR.bottomh, fromR.bottomh);
            let lwrR = new AnchoredRect(0, w / 2, w, 0, toph, toph + bottomh);

            let symCntrX = Math.max(uprR.width, midR.width, lwrR.width) / 2;

            this.toExpr.offset(symCntrX - uprR.width / 2, 0);

            this.varExpr.offset(symCntrX - lwrR.width / 2, uprR.height + midR.height);
            this.drawableEq.offset(symCntrX - lwrR.width / 2 + varR.width, uprR.height + midR.height);
            this.fromExpr.offset(symCntrX - lwrR.width / 2 + varR.width + eqR.width, uprR.height + midR.height);

            this.drawableSym.offset(symCntrX - symR.width / 2, uprR.height + midR.height / 2 - symR.height / 2);

            let x = symCntrX + Math.max(uprR.width, midR.width, lwrR.width) / 2;

            this.drawableLeftBracket.offset(x, uprR.height + midR.height / 2 - fnR.height / 2);
            this.fnExpr.offset(x + lbR.width, uprR.height + midR.height / 2 - fnR.height / 2);
            this.drawableRightBracket.offset(x + lbR.width + fnR.width, uprR.height + midR.height / 2 - fnR.height / 2);

            let _w = x + lbR.width + fnR.width + rbR.width + p;
            let _toph = uprR.height + midR.toph;
            let _bottomh = lwrR.height + midR.bottomh;
            this.bounds.set(0, _w / 2, _w, 0, _toph, _toph + _bottomh);

            return this.bounds;
        }

        toString(): string {
            return this.formatString(this.getName(), "{}", this.varExpr, this.fromExpr, this.toExpr, this.fnExpr);
        }

        varName: string = ""
        result: Eval.EvalValue | undefined = undefined;
        from: BigNumber | undefined;
        to: BigNumber | undefined;

        taskIsEvaluable() { return true; }
        taskInitialize(state: Eval.EvalState) {
            return new Promise<number>((resolve, reject) => {
                this.result = undefined;
                this.varName = this.varExpr.toString().trim();
                if (!Grammar.isVariable(this.varName)) {
                    reject(Eval.EvalError.SyntaxError(state, Eval.EvalErrorCode.InvalidFunctionParameters, this.varName));
                    return;
                }

                let { mc } = state;

                this.fromExpr.evaluate(state)
                    .then(value => {
                        this.from = Eval.requireBigNumber(value);
                        return this.toExpr.evaluate(state);
                    })
                    .then(value => {
                        this.to = Eval.requireBigNumber(value);
                        this.from = Eval.requireBigNumber(this.from);

                        if (this.from.isInteger() && this.to.isInteger()) {
                            if (this.from.gt(this.to, mc)) {
                                [this.from, this.to] = [this.to, this.from];
                            }
                            let stepCount = this.to.sub(this.from, mc).add(1, mc).toNumber();
                            resolve(stepCount);
                        }
                        else {
                            reject(Eval.EvalError.MathError(state));
                        }
                    })
                    .catch(err => {
                        reject(err);
                    });
            });
        }
        taskDoStep(stepIndex: number, state: Eval.EvalState) {
            return new Promise<Eval.EvalValue>((resolve, reject) => {

                let { mc } = state;

                this.from = Assert.require(this.from);

                state.pushLocalParams([this.varName], [this.from.add(stepIndex, mc)]);

                this.fnExpr.evaluate(state).
                    then(value => {
                        this.result = this.result ? this.seriesOp(this.result, value, state) : value;
                        resolve(this.result);
                        state.popLocalParams();
                    }).
                    catch(err => reject(err));
            });
        }

    }

    export class NSummation extends NSeries {
        constructor() {
            super("NSummation");
        }
        getName() { return Vocabulary.summation; }
        getSymbol() { return "Σ"; }
        seriesOp(a: Eval.EvalValue, b: Eval.EvalValue, s: Eval.EvalState): Eval.EvalValue {
            return Eval.fnAdd(a, b, s);
        }
    }

    export class NProduct extends NSeries {
        constructor() {
            super("NProduct");
        }
        getName() { return Vocabulary.product; }
        getSymbol() { return "Π"; }
        seriesOp(a: Eval.EvalValue, b: Eval.EvalValue, s: Eval.EvalState): Eval.EvalValue {
            return Eval.fnMul(a, b, s);
        }
    }

    export class NMatrix extends NNode {
        public readonly nrows: number;
        public readonly ncols: number;

        private cells: NExpression[] = [];

        private drawableLeftBracket: Drawable.Bracket;
        private drawableRightBracket: Drawable.Bracket;

        constructor(nrows: number, ncols: number) {
            super("NMatrix");

            Assert.int_gte(nrows, 1)
            Assert.int_gte(ncols, 1)

            this.nrows = nrows;
            this.ncols = ncols;

            this.drawableLeftBracket = new Drawable.Bracket(this, Drawable.ThemeStyle.Decoration, BracketSymbol.LeftSquareBracket);
            this.drawableRightBracket = new Drawable.Bracket(this, Drawable.ThemeStyle.Decoration, BracketSymbol.RightSquareBracket);

            this.setCells();
        }

        /**
         * 
         * @param cells cells[0] = row0, row0[0] = cell0 of row0...
         */
        setCells(cells?: NExpression[][]): NMatrix {
            this.cells.forEach(e => nodeRelease(e));

            if (Utils.Arr.isArray(cells)) {
                Assert.assert(cells.length === this.nrows);
                cells.forEach(row => Assert.assert(row.length === this.ncols));
            }

            // Setup cells
            this.cells = [];
            for (let i = 0; i < this.nrows; i++) {
                for (let j = 0; j < this.ncols; j++) {
                    let expr = Utils.Arr.isArray(cells) ? cells[i][j] : new NExpression();
                    this.cells.push(expr);
                }
            }

            this.cells.forEach(e => nodeAssign(e, this));

            this.notifyChanged();

            return this;
        }

        getCell(row: number, col: number): NExpression {
            Assert.int_between(row, 0, this.nrows - 1);
            Assert.int_between(col, 0, this.ncols - 1);
            return this.cells[row * this.ncols + col];
        }

        getNodeList(): NNode[] {
            return this.cells;
        }

        protected getDrawableList(): Drawable.Drawable[] {
            return [this.drawableLeftBracket, this.drawableRightBracket];
        }

        layout() {
            if (!this._needUpdate) {
                return this.bounds;
            }

            let p = getPadding() * 2;

            this.cells.forEach(e => e.layout());

            let rowsH = [];
            let colsW = [];

            for (let i = 0; i < this.nrows; i++) {
                let rowH = 0;
                for (let j = 0; j < this.ncols; j++) {
                    let { height } = this.getCell(i, j).bounds;
                    rowH = Math.max(rowH, p + height + p);
                }
                rowsH.push(rowH);
            }

            for (let j = 0; j < this.ncols; j++) {
                let colW = 0;
                for (let i = 0; i < this.nrows; i++) {
                    let { width } = this.getCell(i, j).bounds;
                    colW = Math.max(colW, p + width + p);
                }
                colsW.push(colW);
            }

            let contentW = 0, contentH = 0;

            rowsH.forEach(rowH => contentH += rowH);
            colsW.forEach(colW => contentW += colW);

            let lbR = this.drawableLeftBracket.layout(contentH);
            let rbR = this.drawableRightBracket.layout(contentH);

            this.drawableLeftBracket.offset(0, 0);
            this.drawableRightBracket.offset(lbR.width + contentW, 0);

            let rowTop = 0;
            for (let i = 0; i < this.nrows; i++) {
                let rowH = rowsH[i];
                let colLeft = 0;
                for (let j = 0; j < this.ncols; j++) {
                    let cell = this.getCell(i, j);
                    let { width: cellW, height: cellH } = cell.bounds;
                    let colW = colsW[j];

                    cell.offset(lbR.width + colLeft + colW / 2 - cellW / 2, rowTop + rowH / 2 - cellH / 2);
                    colLeft += colW;
                }
                rowTop += rowH;
            }

            this.bounds.set(0, lbR.width + contentW + rbR.width, 0, contentH);

            return this.bounds;
        }

        taskIsEvaluable() { return true; }
        taskInitialize() { return Promise.resolve(1); }
        taskDoStep(stepIndex: number, state: Eval.EvalState) {
            return new Promise<Eval.EvalValue>((resolve, reject) => {
                this.step(0, new Eval.Matrix(this.nrows, this.ncols, Eval.MatrixSetZero), state).
                    then(value => resolve(value)).
                    catch(err => reject(err));
            });
        }

        private step(current: number, result: Eval.Matrix, state: Eval.EvalState) {
            return new Promise<Eval.EvalValue>((resolve, reject) => {
                let c = current % this.ncols;
                let r = Math.trunc(current / this.ncols);

                this.getCell(r, c).evaluate(state).then(value => {
                    result.cell(r, c, value);
                    if (++current === this.nrows * this.ncols) {
                        resolve(result);
                        return;
                    }
                    else {
                        resolve(this.step(current, result, state));
                        return;
                    }
                }).catch(err => reject(err));
            });
        }

        toString(): string {
            let str = Vocabulary.matrix as string;
            for (let i = 0; i < this.nrows; i++) {
                str += "{";
                for (let j = 0; j < this.ncols; j++) {
                    str += "{" + this.getCell(i, j).toString() + "}";
                }
                str += "}";
            }
            return str;
        }
    }

    export class NCalculation extends NNode {
        private expr!: NExpression;
        private resultExprList: NExpression[] = [];

        constructor() {
            super("NCalculation");

            this.setExpression();
            this.clearResult();
        }

        isEmpty(): boolean {
            return this.getExpression().nodeCount() === 0;
        }

        gatherPath(path: ExpressionPath.Slot[]) {
            // Iterate expression node only
            this.getExpression().gatherPath(path);
        }

        getExpression(): NExpression {
            return this.expr;
        }

        setExpression(expr?: NExpression) {
            nodeRelease(this.expr);
            this.expr = expr ?? new NExpression();
            nodeAssign(this.expr, this);
            this.notifyChanged();
        }

        clearResult() {
            this.resultExprList.forEach(n => nodeRelease(n));
            this.resultExprList = [];
            this.notifyChanged();
        }

        addResultExpr(resultExpr: NExpression) {
            // "=" in the beginning
            if (resultExpr.nodeCount() > 0 && !(resultExpr.getNode(0) instanceof NEqual)) {
                resultExpr.insertNodes(0, new NEqual());
            }

            nodeAssign(resultExpr, this);
            this.resultExprList.push(resultExpr);

            this.notifyChanged();
        }

        getNodeList(): NNode[] {
            return [this.expr, ...this.resultExprList];
        }

        protected getDrawableList(): Drawable.Drawable[] {
            return [];
        }

        layout() {
            if (!this._needUpdate) {
                return this.bounds;
            }

            let expr = this.getExpression();
            let resList = this.resultExprList;

            let exprR = expr.layout();
            let resRList = resList.map(res => res.layout());

            let width = exprR.width;
            let toph = exprR.toph;
            let bottomh = exprR.bottomh;

            resRList.forEach(r => {
                width += r.width;
                toph = Math.max(toph, r.toph);
                bottomh = Math.max(bottomh, r.bottomh);
            });

            this.bounds.set(0, width / 2, width, 0, toph, toph + bottomh);

            let x = 0;
            expr.offset(x, toph - exprR.toph);
            x += exprR.width;

            resList.forEach(n => {
                n.offset(x, toph - n.bounds.toph);
                x += n.bounds.width;
            });

            return this.bounds;
        }

        toString(withResult?: boolean): string {
            return this.getExpression().toString() + (withResult ? this.resultExprList.map(n => n.toString()).join("") : "");
        }

        public executeList(state: Eval.EvalState) {
            return new Promise<Eval.EvalDeclValue[]>((resolve, reject) => {
                resolve(this.getExpression().executeList(state, true));
            });
        }

    }

}