import * as React from "react";
import { Nodes } from "./nodes"
import { EvalDeclValue, EvalState } from "@tspro/math-lib/eval";
import { Svg } from "./svg";
import { Drawable } from "./drawable";
import { ExpressionPath } from "./expression-path";
import { Parser } from "@tspro/math-lib/parser";
import { MathObjectEditor } from "./math-object-editor";
import { MathObjectHistory, MathObjectPage } from "./math-object-history";
import { Assert, Device, Utils } from "@tspro/ts-utils-lib";

export class MathObject {
    private static counter: number = 0;
    public readonly id = MathObject.counter++;

    public readonly elem = document.createElement("div");
    public readonly Component = <div key={this.id} ref={e => this.assignTo(e)} onClick={event => this.onClick(event)} />;

    private cursorSvgElem = Svg.createElement("svg");
    private cursorSvgNode = new Svg.RectNode();

    private timerId: number | undefined = undefined;

    private static UpdateDelayMs = 25

    private cursorWidth: number;
    private get padding() { return this.cursorWidth; }; // padding prevent cursor hide outside svg element

    private _rootNode?: Nodes.NCalculation;

    private fontLevel: number = 0;
    private path?: ExpressionPath.Path;
    public readonly editor = new MathObjectEditor(this);
    public readonly history = new MathObjectHistory(this);

    private isCalculating: boolean = false;

    private constructor(expr?: Nodes.NExpression) {
        Utils.Dom.addClass(this.elem, "math-object");
        //Html.addClass(this.elem, "no-select");

        Svg.addClass(this.cursorSvgElem, Drawable.ThemeStyle.Cursor);

        this.cursorWidth = Math.max(1, Device.toPx("0.5mm"));

        this.rootNode = new Nodes.NCalculation();
        if (expr) {
            this.rootNode.setExpression(expr);
        }
    }

    static create(expr?: Nodes.NExpression) {
        return new MathObject(expr);
    }

    private assignTo(e: HTMLElement | null) {
        if (e) {
            Utils.Dom.appendTo(this.elem, e);
        }
    }

    private onClick(e: React.MouseEvent) {
        if (this.isCalculating) {
            return;
        }
        let offset = this.elem && Utils.Dom.getOffset(this.elem);
        if (offset) {
            let x = e.clientX - offset.left,
                y = e.clientY - offset.top;

            this.editor.pickSelection(x, y);
        }
    }

    setPage(page: MathObjectPage) {
        let expr = Parser.parseExpression(page.expression);
        this.rootNode.setExpression(expr);
        this.editor.setSelection(page.selectionPos);
        this.history.savePage();
    }

    requestUpdate() {
        if (this.timerId) {
            window.clearTimeout(this.timerId);
        }
        this.timerId = window.setTimeout(() => this.execUpdate(), MathObject.UpdateDelayMs);
        this.path = undefined;
    }

    forcePendingUpdate() {
        if (this.timerId) {
            this.execUpdate();
        }
    }

    private execUpdate() {
        if (this.timerId) {
            window.clearTimeout(this.timerId);
            this.timerId = undefined;
        }
        this.update();
    }

    isEmpty(): boolean {
        return this.rootNode.isEmpty();
    }

    showCursor(cursorPos?: number) {
        if (cursorPos !== undefined) {
            this.editor.selectionPos = cursorPos;
        }
        Utils.Dom.appendTo(this.cursorSvgElem, this.elem);
    }

    hideCursor() {
        Utils.Dom.removeFromParent(this.cursorSvgElem);
    }

    scaleDown() {
        this.fontLevel++;
    }

    scaleUp() {
        this.fontLevel = Assert.isIntegerGte(this.fontLevel - 1, 0, "fontLevel");
    }

    getFont() {
        return Drawable.Font.getFont(this.fontLevel);
    }

    private layoutNodes() {
        this.rootNode.layout();
        this.rootNode.offset(this.padding, this.padding);
    }

    private updateElements() {
        let r = this.rootNode.bounds;
        Utils.Dom.setRect(this.elem, 0, 0, 2 * this.padding + r.width, 2 * this.padding + r.height);
        Svg.setRect(this.cursorSvgElem, 0, 0, 2 * this.padding + r.width, 2 * this.padding + r.height);
    }

    private updateCursorNode() {
        let r = this.getCursorRectData();
        if (r) {
            this.cursorSvgNode.update(r);
            Utils.Dom.appendTo(this.cursorSvgNode.getElement(), this.cursorSvgElem);
        }
        else {
            Utils.Dom.removeFromParent(this.cursorSvgNode.getElement());
        }
    }

    update() {
        this.layoutNodes();
        this.updateElements();
        this.updateCursorNode();
    }

    get rootNode(): Nodes.NCalculation {
        return Assert.require(this._rootNode, "get rootNode()");
    }

    set rootNode(node: Nodes.NCalculation) {
        if (this._rootNode === node) {
            return;
        }

        if (this._rootNode) {
            this._rootNode.mathObject = undefined;
        }
        this._rootNode = node;
        if (this._rootNode) {
            this._rootNode.mathObject = this;
        }

        this.editor.selectionPos = 0;
        this.requestUpdate();
    }

    getPath(): ExpressionPath.Path {
        this.forcePendingUpdate();

        if (!this.path) {
            this.path = new ExpressionPath.Path(this);
        }

        return this.path;
    }

    getCursorRectData() {
        let slot = this.getPath().getSlotDataAt(this.editor.selectionPos);
        if (!slot) {
            return undefined;
        }

        let exprR = slot.expr.bounds;
        let leftR = slot.leftBlock ? slot.leftBlock.rect : undefined;
        let rightR = slot.rightBlock ? slot.rightBlock.rect : undefined;

        let cursorX = leftR ? leftR.right : (rightR ? rightR.left : exprR.left);
        let cursorTop = (leftR && rightR) ? Math.min(leftR.top, rightR.top) : (leftR ? leftR.top : (rightR ? rightR.top : exprR.top));
        let cursorBottom = (leftR && rightR) ? Math.max(leftR.bottom, rightR.bottom) : (leftR ? leftR.bottom : (rightR ? rightR.bottom : exprR.bottom));

        return new Svg.RectData(
            cursorX - this.cursorWidth / 2,
            cursorTop,
            cursorX + this.cursorWidth / 2,
            cursorBottom, 0);
    }

    execute(state: EvalState) {
        this.isCalculating = true;

        return new Promise<EvalDeclValue[]>((resolve, reject) => {
            this.rootNode.executeList(state)
                .then(value => resolve(value))
                .catch(err => reject(err))
                .finally(() => this.isCalculating = false);
        });
    }

    toString(includeResult?: boolean): string {
        return this.rootNode.toString(includeResult);
    }
}


