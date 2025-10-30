import { Nodes } from "./nodes";
import { MathObject } from "./math-object";
import { Svg } from "./svg";
import { BracketSymbol } from "@tspro/math-lib/parser";
import { Utils, Device, Rect, AnchoredRect } from "@tspro/ts-utils-lib";

function getFontName() {
    return "Comic Sans";
}

function minStrokeWidth(sw: number) {
    return Math.max(sw, 1);
}

function clamp(a: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, a));
}

export namespace Drawable {

    export enum ThemeStyle {
        Default = "theme-style-default",
        Cursor = "theme-style-cursor",
        Number = "theme-style-number",
        Variable = "theme-style-variable",
        Function = "theme-style-function",
        Operator = "theme-style-operator",
        Decoration = "theme-style-decoration",
    }

    export class Font {
        name: string;
        size: number;
        weight: number; // 0..1
        strokeWidth: number;

        private constructor(readonly factor: number) {
            this.name = getFontName();
            this.size = Device.FontSize * factor;
            this.weight = 4 / factor;
            this.strokeWidth = 1;
        }

        applyTo(elem: HTMLElement) {
            elem.style.fontFamily = this.name;
            elem.style.fontSize = this.size + "px";
            elem.style.fontWeight = clamp(Math.round(this.weight), 1, 9) + "00";
        }

        private static fontList: Font[] = [];

        private static createFontList() {
            return [new Font(1.0), new Font(0.8)];
        }

        static getFont(level: number = 0): Font {
            if (this.fontList.length === 0) {
                this.fontList = this.createFontList();
            }
            return this.fontList[clamp(level, 0, this.fontList.length - 1)];
        }

    }

    export abstract class Drawable {

        public readonly bounds = new Rect();
        public readonly elem = this.createSpan();
        protected svgNode?: SVGSVGElement;

        protected isVisible: boolean = true;

        private _styleClass: string = "";

        constructor(protected readonly parent: Nodes.NNode, style: ThemeStyle) {
            this.setStyle(style);
        }

        protected createSpan(): HTMLElement {
            let el = document.createElement("span");
            el.style.position = "absolute";
            el.style.whiteSpace = "nowrap";
            return el;
        }

        setSvgElem(svgElem: SVGElement) {
            if (!this.svgNode) {
                this.svgNode = Svg.createElement("svg");
                Utils.Dom.appendTo(this.svgNode, this.elem);
            }
            Utils.Dom.appendTo(svgElem, this.svgNode);
        }

        setStyle(style: ThemeStyle) {
            let oldStyle = this._styleClass;
            let newStyle = this._styleClass = style.toString();
            if (newStyle !== oldStyle) {
                Utils.Dom.removeClass(this.elem, oldStyle);
                Utils.Dom.addClass(this.elem, newStyle);
            }
        }

        set visible(visible: boolean) {
            this.isVisible = visible;
        }

        set mathObject(obj: MathObject | undefined) {
            if (obj) { Utils.Dom.appendTo(this.elem, obj.elem) }
            else { Utils.Dom.removeFromParent(this.elem); }
        }

        protected get font(): Font {
            let { mathObject } = this.parent;
            return mathObject ? mathObject.getFont() : Font.getFont();
        }

        protected updateBoundsSize(w: number, h: number) {
            this.bounds.set(w, h);
            if (this.svgNode) {
                Svg.setRect(this.svgNode, 0, 0, w, h);
            }
            return this.bounds.toAnchoredRect();
        }

        protected beforeLayout() {
            this.font.applyTo(this.elem);
            Utils.Dom.setVisibility(this.elem, this.isVisible);
        }

        offset(x: number = 0, y: number = 0) {
            this.bounds.offsetInPlace(x, y);
            Utils.Dom.setOffset(this.elem, this.bounds.left, this.bounds.top, "px");
        }
    }

    export class Text extends Drawable {
        private _text: string = "";

        constructor(parentNode: Nodes.NNode, style: ThemeStyle, text: string = "") {
            super(parentNode, style);
            this.setText(text);
            Utils.Dom.setVisibility(this.elem, false);
        }

        setText(text: string) {
            if (text !== this._text) {
                this.elem.innerText = this._text = text;
            }
        }

        getText() {
            return this._text;
        }

        layout(): AnchoredRect {
            super.beforeLayout();
            let w = Utils.Dom.getWidth(this.elem);
            let h = Utils.Dom.getHeight(this.elem);
            if (h === 0) {
                h = Device.FontSize * 1.5;
            }
            return this.updateBoundsSize(w, h);
        }

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
    }

    export class FractionLine extends Drawable {
        private lineSvgData = new Svg.LineData();
        private lineSvgNode = new Svg.LineNode();

        constructor(parentNode: Nodes.NNode, style: ThemeStyle) {
            super(parentNode, style);
            this.setSvgElem(this.lineSvgNode.getElement());
        }

        layout(width: number, toph: number, bottomh: number): AnchoredRect {
            super.beforeLayout();

            this.lineSvgData.x1 = 0;
            this.lineSvgData.y1 = toph;
            this.lineSvgData.x2 = width;
            this.lineSvgData.y2 = toph;
            this.lineSvgData.strokeWidth = minStrokeWidth(this.font.strokeWidth);
            this.lineSvgNode.update(this.lineSvgData);

            return this.updateBoundsSize(width, toph + bottomh);
        }
    }

    export class Bracket extends Drawable {
        private bracketSvgData = new Svg.RectData();
        private bracketSvgNode: Svg.BracketNode;

        constructor(parentNode: Nodes.NNode, style: ThemeStyle, readonly symbol: BracketSymbol) {
            super(parentNode, style);
            this.bracketSvgNode = new Svg.BracketNode(symbol);
            this.setSvgElem(this.bracketSvgNode.getElement());
        }

        layout(height: number): AnchoredRect {
            super.beforeLayout();
            this.bracketSvgData.left = 0;
            this.bracketSvgData.top = 0;
            this.bracketSvgData.right = this.font.size * 0.6;
            this.bracketSvgData.bottom = height;
            this.bracketSvgData.strokeWidth = minStrokeWidth(this.font.strokeWidth);

            this.bracketSvgNode.update(this.bracketSvgData);

            return this.updateBoundsSize(this.bracketSvgData.width, this.bracketSvgData.height);
        }

    }

    export class Radical extends Drawable {
        private radicalSvgData = new Svg.RadicalData();
        private radicalSvgNode = new Svg.RadicalNode();

        public radicalSymbolWidth = 0;

        constructor(parentNode: Nodes.NNode, style: ThemeStyle) {
            super(parentNode, style);
            this.setSvgElem(this.radicalSvgNode.getElement());
        }

        layout(exprWidth: number, exprHeight: number): AnchoredRect {
            super.beforeLayout();

            this.radicalSymbolWidth = this.font.size * 0.6;

            this.radicalSvgData.left = 0;
            this.radicalSvgData.top = 0;
            this.radicalSvgData.topBarLeft = this.radicalSymbolWidth;
            this.radicalSvgData.topBarRight = this.radicalSymbolWidth + exprWidth;
            this.radicalSvgData.bottom = exprHeight;
            this.radicalSvgData.strokeWidth = minStrokeWidth(this.font.strokeWidth);

            this.radicalSvgNode.update(this.radicalSvgData);

            return this.updateBoundsSize(this.radicalSvgData.width, this.radicalSvgData.height);
        }

    }
}