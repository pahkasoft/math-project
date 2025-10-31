import { MathObject } from "./math-object";
import { Nodes } from "./nodes";
import { ExpressionPath } from "./expression-path";
import { Grammar } from "@tspro/math-lib/parser";
import { Assert, Utils } from "@tspro/ts-utils-lib";

export type SelectionPos = number | "left" | "right";

export class MathObjectEditor {
    private _selectionPos: number = 0;

    public constructor(private readonly mathObject: MathObject) { }

    public getPath() {
        return this.mathObject.getPath();
    }

    public get selectionPos(): number {
        return this._selectionPos;
    }

    public set selectionPos(pos: number) {
        let maxPos = this.getPath().getMaxSelectionPos();
        this._selectionPos = Assert.isIntegerBetween(pos, 0, maxPos, "Invalid selection pos!");
        this.mathObject.requestUpdate();
    }

    public setSelection(pos: SelectionPos) {
        if (pos === "left") {
            this.selectionPos = 0;
        }
        else if (pos === "right") {
            this.selectionPos = this.getPath().getMaxSelectionPos();
        }
        else {
            this.selectionPos = pos;
        }
    }

    pickSelection(x: number, y: number) {
        let cursorPos = this.getPath().getSelectionPosAt(x, y);
        if (cursorPos !== undefined) {
            this.setSelection(cursorPos);
        }
    }

    moveSelection(dlt: number) {
        let newPos = this.selectionPos + dlt;
        let maxPos = this.getPath().getMaxSelectionPos();
        while (newPos > maxPos) { newPos -= maxPos + 1; }
        while (newPos < 0) { newPos += maxPos + 1; }
        this.selectionPos = newPos;
    }

    moveSelectionLeft(n: number = 1) { this.moveSelection(-n); }
    moveSelectionRight(n: number = 1) { this.moveSelection(n); }

    insertSymbols(str: string) {
        if (Grammar.testRule(str, Grammar.Rules.ADD, Grammar.Rules.SUBTRACT)) {
            this.insertNode(new Nodes.NTermOp(str));
        }
        else if (Grammar.testRule(str, Grammar.Rules.MULTIPLY, Grammar.Rules.DIVIDE, Grammar.Rules.MODULO, Grammar.Rules.CROSS_PRODUCT)) {
            this.insertNode(new Nodes.NFactorOp(str));
        }
        else if (Grammar.testRule(str, Grammar.Rules.FACTORIAL)) {
            this.insertNode(new Nodes.NFactorial());
        }
        else if (Grammar.testRule(str, Grammar.Rules.TRANSPOSE)) {
            this.insertNode(new Nodes.NTranspose());
        }
        else if (Grammar.testRule(str, Grammar.Rules.EXPONENT)) {
            this.insertNode(new Nodes.NExponent());
        }
        else if (Grammar.testRule(str, Grammar.Rules.EQUAL)) {
            this.insertNode(new Nodes.NEqual());
        }
        else if (Grammar.testRule(str, Grammar.Rules.DECLARE)) {
            this.insertNode(new Nodes.NDeclare());
        }
        else if (Grammar.testRule(str, Grammar.Rules.COMMA)) {
            this.insertNode(new Nodes.NComma());
        }
        else if (str === "(") {
            this.insertNode(new Nodes.NBracket());
        }
        else if (str === " ") {
            this.insertNode(new Nodes.NSpace());
        }
        else if (Grammar.testRule(str, Grammar.Rules.SYMBOL_SEQUENCE)) {
            Utils.Str.toCharArray(str).forEach(sym => this.insertNode(new Nodes.NSymbol(sym)));
        }
        else {
            return false;
        }
        return true;
    }

    insertFunction(name: string) {
        let n = Nodes.createDecoratedFunction(name);
        if (n !== undefined) {
            this.insertNode(n);
        }
        else {
            this.insertSymbols(name);
            this.insertNode(new Nodes.NBracket());
        }
    }

    insertMatrix(rows: number, columns: number) {
        this.insertNode(new Nodes.NMatrix(rows, columns));
    }

    private insertNode(insertWhat: Nodes.NNode) {
        let slot = this.getPath().getSlotDataAt(this.selectionPos);
        slot = Assert.require(slot, "slot is required.");

        let leftBlock = slot.leftBlock;
        let rightBlock = slot.rightBlock;
        let parentExpr = slot.expr;
        let parentExprIsEmpty = parentExpr.isEmpty() && !leftBlock && !rightBlock;

        // Insert decorated function
        if (insertWhat instanceof Nodes.NBracket && parentExpr && leftBlock && leftBlock.node instanceof Nodes.NSymbol) {
            if (this.insertDecoratedFunction(parentExpr, leftBlock.node)) {
                return;
            }
        }

        let cursorInc: number = 1;

        if (leftBlock instanceof ExpressionPath.Block) {
            parentExpr.insertAfter(leftBlock.node, insertWhat);
            cursorInc = 1;
        }
        else if (rightBlock instanceof ExpressionPath.Block) {
            parentExpr.insertBefore(rightBlock.node, insertWhat);
            cursorInc = 1;
        }
        else if (parentExprIsEmpty) {
            parentExpr.addNodes(insertWhat);
            cursorInc = 1;
        }

        if (insertWhat instanceof Nodes.NFraction) {
            cursorInc += this.fillFractionWithNeighbors(insertWhat);
        }

        this.moveSelection(cursorInc);
    }

    private insertDecoratedFunction(parentExpr: Nodes.NExpression, symbolNodeBeforeBracket: Nodes.NSymbol) {
        let symbolNodeIndex = parentExpr.indexOf(symbolNodeBeforeBracket);
        Assert.isIntegerBetween(symbolNodeIndex, 0, parentExpr.nodeCount());

        let symbolNodeList: Nodes.NSymbol[] = [];
        for (let i = symbolNodeIndex; i >= 0; i--) {
            let n = parentExpr.getNode(i);
            if (n instanceof Nodes.NSymbol) {
                symbolNodeList.unshift(n);
            }
            else {
                break;
            }
        }

        let functionName = symbolNodeList.map(n => n.toString()).join("");
        let functionNode = Nodes.createDecoratedFunction(functionName);
        if (functionNode) {
            let len = symbolNodeList.length;
            let start = symbolNodeIndex - (len - 1);
            parentExpr.splice(start, len, functionNode);
            this.moveSelectionLeft(len - 1);
            return true;
        }
        else {
            return false;
        }
    }

    private fillFractionWithNeighbors(frac: Nodes.NFraction): number {
        let parentExpr = Assert.require(frac.parentExpression);

        let index = Assert.isIndex(parentExpr.indexOf(frac));
        let nodes = parentExpr.getNodeList();

        let leftNodes: Nodes.NNode[] = [],
            rightNodes: Nodes.NNode[] = [];

        const accept = (n?: Nodes.NNode): boolean => !!n && (n.isEvaluable() || n instanceof Nodes.NSymbol);

        let il = index - 1, ir = index + 1;
        while (accept(nodes[il])) { leftNodes.unshift(nodes[il]); il--; }
        while (accept(nodes[ir])) { rightNodes.push(nodes[ir]); ir++; }

        let leftExpr = new Nodes.NExpression(...leftNodes);
        let rightExpr = new Nodes.NExpression(...rightNodes);

        frac.setArgs(leftExpr, rightExpr);

        return !leftExpr.isEmpty() && rightExpr.isEmpty() ? 1 : 0;
    }

    handleDelete() {
        let slot = Assert.require(this.getPath().getSlotDataAt(this.selectionPos));

        let rightBlock = slot.rightBlock;
        if (rightBlock) {
            this.deleteNode(rightBlock.node);
        }
    }

    handleBackspace() {
        let slot = Assert.require(this.getPath().getSlotDataAt(this.selectionPos));

        let leftBlock = slot.leftBlock;
        if (leftBlock) {
            this.deleteNode(leftBlock.node);
        }
        else if (this.selectionPos > 0) {
            this.moveSelectionLeft();
        }
    }

    private deleteNode(node: Nodes.NNode) {
        let range = this.getPath().getNodeRange(node);
        if (range) {
            this.setSelection(range.start);
        }

        let p = node.parentExpression;

        if (node instanceof Nodes.NExpression) {
            node.removeAllNodes();
        }
        else if (node instanceof Nodes.NCalculation) {
            node.setExpression();
        }
        else if (p) {
            p.removeNode(node);
        }
    }

}
