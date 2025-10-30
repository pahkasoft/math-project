
export type RectProps = { left: number, right: number, top: number, bottom: number }

export class DivRect {
    left: number = 0;
    right: number = 0;
    top: number = 0;
    center: number = 0;
    bottom: number = 0;

    constructor() { }

    /**
     * Usages:
     * set(left, right, top, bottom)
     * set(left, right, top, center, bottom)
     */
    set(left: number, right: number, top: number, center: number, bottom?: number): DivRect {
        if (bottom === undefined) {
            bottom = center;
            center = (top + bottom) / 2;
        }

        if (right < left) {
            [left, right] = [right, left];
        }
        if (center < top) {
            [center, top] = [top, center];
        }
        if (bottom < center) {
            [center, bottom] = [bottom, center];
        }

        this.left = left;
        this.right = right;
        this.top = top;
        this.center = center;
        this.bottom = bottom;

        return this;
    }

    /**
     * Usages:
     * setRect(rect)
     */
    setRect(r: DivRect | RectProps): DivRect {
        if (r instanceof DivRect) {
            this.set(r.left, r.right, r.top, r.center, r.bottom);
        }
        else {
            this.set(r.left, r.right, r.top, (r.top + r.bottom) / 2, r.bottom);
        }
        return this;
    }

    /**
     * Usages:
     * setSize(width, height)
     * setSize(width, toph, bottomh)
     */
    setSize(width: number, height: number, height2?: number) {
        let toph = height2 === undefined ? height / 2 : height;
        let bottomh = height2 === undefined ? height / 2 : height2;

        this.left = 0;
        this.right = width;
        this.top = 0;
        this.center = toph;
        this.bottom = this.center + bottomh;

        return this;
    }

    get width() {
        return this.right - this.left;
    }

    get height() {
        return this.bottom - this.top;
    }

    get toph() {
        return this.center - this.top;
    }

    get bottomh() {
        return this.bottom - this.center;
    }

    get area() {
        return this.width * this.height;
    }

    offset(dx: number, dy: number) {
        this.left += dx;
        this.right += dx;
        this.top += dy;
        this.center += dy;
        this.bottom += dy;
        return this;
    }

    offsetTo(x: number, y: number) {
        this.offset(x - this.left, y - this.top);
        return this;
    }

    contains(x: number, y: number): boolean {
        return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom;
    }

    toString(): string {
        return "DivRect(" + this.left + ", " + this.right + ", " + this.top + ", " + this.center + ", " + this.bottom + ")";
    }
}
