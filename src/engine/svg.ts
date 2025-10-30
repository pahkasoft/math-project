import { Assert } from "@tspro/ts-utils-lib";
import { BracketSymbol } from "@tspro/math-lib/parser";

export namespace Svg {
    const SVG_NS = "http://www.w3.org/2000/svg";

    interface SVGElementTagNameMap {
        "svg": SVGSVGElement;
        "line": SVGLineElement;
        "path": SVGPathElement;
    }

    export function createElement<K extends keyof SVGElementTagNameMap>(tagName: K): SVGElementTagNameMap[K] {
        let el = document.createElementNS(SVG_NS, tagName);
        el.setAttributeNS(null, "shapeRendering", "geometricPrecision");
        return el;
    }

    export function hasClass(el: SVGElement, className: string) {
        let attr = el.getAttribute("class");
        return attr ? new RegExp("(\\s|^)" + className + "(\\s|$)").test(attr) : false;
    }

    export function addClass(el: SVGElement, className: string) {
        if (!hasClass(el, className)) {
            el.setAttribute("class", el.getAttribute("class") + " " + className);
        }
    }

    export function removeClass(el: SVGElement, className: string) {
        let attr = el.getAttribute("class");
        var removedClass = attr ? attr.replace(new RegExp("(\\s|^)" + className + "(\\s|$)", "g"), "$2") : "";
        if (hasClass(el, className)) {
            el.setAttribute("class", removedClass);
        }
    }

    export function setRect(el: SVGElement, left: number, top: number, width: number, height: number, unit: string = "") {
        el.setAttribute("left", "" + left);
        el.setAttribute("top", "" + top);
        el.setAttribute("width", "" + width);
        el.setAttribute("height", "" + height);
    }


    export class BaseNode { }

    export class LineData {
        constructor(public x1: number = 0, public y1: number = 0, public x2: number = 0, public y2: number = 0, public strokeWidth: number = 1) { }
        equals(data: LineData) {
            return this.x1 === data.x1 && this.y1 === data.y1 && this.x2 === data.x2 && this.y2 === data.y2 && this.strokeWidth === data.strokeWidth;
        }
        copyTo(data: LineData): LineData {
            return Object.assign(data, this);
        }
    }

    export class LineNode extends BaseNode {
        data = new LineData();
        el = Svg.createElement("line");

        constructor() {
            super();
        }

        update(data: LineData) {
            let { el } = this;

            if (this.data.equals(data)) {
                return el;
            }
            data.copyTo(this.data);

            el.setAttribute("x1", "" + data.x1);
            el.setAttribute("y1", "" + data.y1);
            el.setAttribute("x2", "" + data.x2);
            el.setAttribute("y2", "" + data.y2);
            el.setAttributeNS(null, "strokeWidth", data.strokeWidth + "px");

            return el;
        }
    }

    export class RectData {
        constructor(public left: number = 0, public top: number = 0, public right: number = 0, public bottom: number = 0, public strokeWidth: number = 1) { }
        equals(data: RectData) {
            return this.left === data.left && this.top === data.top && this.right === data.right && this.bottom === data.bottom && this.strokeWidth === data.strokeWidth;
        }
        copyTo(data: RectData): RectData {
            return Object.assign(data, this);
        }

        get width(): number { return this.right - this.left; }
        get height(): number { return this.bottom - this.top; }
    }

    export class RectNode extends BaseNode {
        data = new RectData();
        el = Svg.createElement("path");

        constructor() {
            super();
            this.el.setAttributeNS(null, "stroke", "none");
        }

        update(data: RectData) {
            let { el } = this;

            if (this.data.equals(data)) {
                return el;
            }

            data.copyTo(this.data);

            el.setAttributeNS(null, "d", "M" + data.left + " " + data.top + "L" + data.right + " " + data.top + " L" + data.right + " " + data.bottom + " L" + data.left + " " + data.bottom + "Z");

            return this.el;
        }
    }

    export class RadicalNode extends BaseNode {
        data = new RadicalData();
        el = Svg.createElement("path");

        constructor() {
            super();
        }

        update(data: RadicalData) {
            let { el } = this;

            if (data.equals(this.data)) {
                return el;
            }
            data.copyTo(this.data);

            svgPathSetPolyLine(el, [
                data.left, data.top + (data.bottom - data.top) / 2,
                data.left + (data.topBarLeft - data.left) / 2, data.bottom,
                data.topBarLeft, data.top,
                data.topBarRight, data.top
            ], data.width);

            return el;
        }
    }

    export class RadicalData {
        constructor(public left: number = 0, public topBarLeft: number = 0, public topBarRight: number = 0, public top: number = 0, public bottom: number = 0, public strokeWidth: number = 1) { }
        equals(data: RadicalData) {
            return this.left === data.left && this.topBarLeft === data.topBarLeft && this.topBarRight === data.topBarRight && this.top === data.top && this.bottom === data.bottom && this.strokeWidth === data.strokeWidth;
        }
        copyTo(data: RadicalData): RadicalData {
            return Object.assign(data, this);
        }
        get width() {
            return this.topBarRight - this.left;
        }
        get height() {
            return this.bottom - this.top;
        }
    }

    export class BracketNode extends BaseNode {
        data = new RectData();
        el = Svg.createElement("path");

        constructor(private readonly symbol: BracketSymbol) {
            super();
        }

        update(data: RectData) {
            let { el } = this;

            if (data.equals(this.data)) {
                return el;
            }
            data.copyTo(this.data);

            let { left, top, right, bottom, strokeWidth } = data;

            let sym = this.symbol;

            const w = right - left;
            const h = bottom - top;
            const cy = (top + bottom) / 2;
            const cx = (left + right) / 2;

            const flip = sym === BracketSymbol.RightBracket ||
                sym === BracketSymbol.RightSquareBracket ||
                sym === BracketSymbol.RightCurlyBracket ||
                sym === BracketSymbol.RightFloor ||
                sym === BracketSymbol.RightCeil;

            const doFlip = (x: number) => flip ? w - x : x;

            top += strokeWidth;
            bottom -= strokeWidth;

            if (sym === BracketSymbol.StraightLine) {
                svgPathSetLine(this.el, cx, top, cx, bottom, strokeWidth);
            }
            else if (sym === BracketSymbol.LeftBracket || sym === BracketSymbol.RightBracket) {
                const p = w / 5;
                left += p; right -= p;

                svgPathSetCurve(el, [
                    doFlip(right), top,
                    doFlip(left), top + h * 0.3,
                    doFlip(left), top + h * 0.7,
                    doFlip(right), bottom
                ], strokeWidth);
            }
            else if (sym === BracketSymbol.LeftSquareBracket || sym === BracketSymbol.RightSquareBracket) {
                const p = w / 5;
                left += p; right -= p;

                svgPathSetPolyLine(el, [
                    doFlip(right), top,
                    doFlip(left), top,
                    doFlip(left), bottom,
                    doFlip(right), bottom,
                ], strokeWidth);
            }
            else if (sym === BracketSymbol.LeftFloor || sym === BracketSymbol.RightFloor) {
                const p = w / 5;
                left += p; right -= p;

                svgPathSetPolyLine(el, [
                    doFlip(left), top,
                    doFlip(left), bottom,
                    doFlip(right), bottom,
                ], strokeWidth);
            }
            else if (sym === BracketSymbol.LeftCeil || sym === BracketSymbol.RightCeil) {
                const p = w / 5;
                left += p; right -= p;

                svgPathSetPolyLine(el, [
                    doFlip(right), top,
                    doFlip(left), top,
                    doFlip(left), bottom,
                ], strokeWidth);
            }
            else if (sym === BracketSymbol.LeftCurlyBracket || sym === BracketSymbol.RightCurlyBracket) {
                const p = w / 5;
                left += p; right -= p;

                svgPathSetCurve(el, [
                    doFlip(right), top,
                    doFlip(left), top,
                    doFlip(right), cy,
                    doFlip(left), cy,
                    doFlip(left), cy,
                    doFlip(right), cy,
                    doFlip(left), bottom,
                    doFlip(right), bottom
                ], strokeWidth);
            }
            else {
                Assert.fail(`Bracket "${sym}" not implemented!`);
            }
            return el;
        }
    }


    function svgPathSetLine(path: SVGPathElement, x1: number, y1: number, x2: number, y2: number, sw: number, strokeColor?: string) {
        path.setAttributeNS(null, "d", "M" + x1 + " " + y1 + "L" + x2 + " " + y2);
        path.setAttributeNS(null, "fill", "none");
        if (strokeColor) { path.setAttributeNS(null, "stroke", strokeColor); }
        path.setAttributeNS(null, "strokeWidth", sw + "px");
        return path;
    }

    function svgPathSetPolyLine(path: SVGPathElement, pts: number[], sw: number, strokeColor?: string) {
        Assert.isIntegerGte(pts.length, 4, "Invalid poly line.");
        Assert.assert(pts.length % 2 === 0, "Invalid poly line.");

        let i = 0;
        let str = "M" + pts[i++] + " " + pts[i++] + "L" + pts[i++] + " " + pts[i++];
        while (i < pts.length) {
            str += "L" + pts[i++] + " " + pts[i++];
        }

        path.setAttributeNS(null, "d", str);
        path.setAttributeNS(null, "fill", "none");
        if (strokeColor) { path.setAttributeNS(null, "stroke", strokeColor); }
        path.setAttributeNS(null, "strokeWidth", sw + "px");
    }

    function svgPathSetCurve(p: SVGPathElement, pts: number[], sw: number, strokeColor?: string) {
        Assert.assert(pts.length % 8 === 0, "Invalid curve."); // 4 * [x, y] for each curve

        let i = 0;
        let str = "";
        while (i < pts.length) {
            str += "M" + pts[i++] + " " + pts[i++] + "C" + pts[i++] + " " + pts[i++] + " " + pts[i++] + " " + pts[i++] + " " + pts[i++] + " " + pts[i++];
        }

        p.setAttributeNS(null, "d", str);
        p.setAttributeNS(null, "fill", "none");
        if (strokeColor) { p.setAttributeNS(null, "stroke", strokeColor); }
        p.setAttributeNS(null, "strokeWidth", sw + "px");
    }

}