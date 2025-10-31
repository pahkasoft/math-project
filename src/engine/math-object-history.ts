import { SelectionPos } from "./math-object-editor";
import { MathObject } from "./math-object";
import { Assert } from "@tspro/ts-utils-lib";

export class MathObjectPage {
    private constructor(readonly expression: string, readonly selectionPos: SelectionPos) { }

    static fromExpression(expression: string, selectionPos: SelectionPos) {
        return new MathObjectPage(expression, selectionPos);
    }
    static fromMathObject(mathObject: MathObject) {
        return new MathObjectPage(mathObject.toString(), mathObject.editor.selectionPos);
    }
    static empty() {
        return new MathObjectPage("", 0);
    }
}

export class MathObjectHistory {
    private pageList: MathObjectPage[];
    private curPageId: number;

    constructor(readonly mathObject: MathObject) {
        this.pageList = [MathObjectPage.empty()];
        this.curPageId = 0;
    }

    private validate() {
        Assert.isIndex(this.curPageId, this.pageList);
    }

    empty() {
        this.pageList = [MathObjectPage.empty()];
        this.curPageId = 0;
    }

    savePage() {
        let curPage = this.pageList[this.curPageId];
        let newPage = MathObjectPage.fromMathObject(this.mathObject);
        if (!curPage || curPage.expression !== newPage.expression) {
            while (this.pageList.length > this.curPageId + 1) { this.pageList.pop(); }
            this.pageList.push(newPage);
            this.curPageId = this.pageList.length - 1;
        }
        this.validate();
    }

    canUndo() {
        return this.curPageId > 0;
    }

    undo() {
        if (this.canUndo()) {
            this.mathObject.setPage(this.pageList[--this.curPageId]);
        }
        this.validate();
    }

    canRedo() {
        return this.curPageId < this.pageList.length - 1;
    }

    redo() {
        if (this.canRedo()) {
            this.mathObject.setPage(this.pageList[++this.curPageId]);
        }
        this.validate();
    }
}
