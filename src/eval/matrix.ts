import { BigNumber, MathContext, RoundingMode } from "bigmath";
import { EvalValue } from "eval";
import { Assert } from "@tspro/ts-utils-lib";

// Js Number is base 10, max 16 digits.
const JsNumberContext = new MathContext(10, 20, RoundingMode.HalfUp);

type CellInputValue = number | EvalValue;

function cellInputToEvalValue(value: CellInputValue): EvalValue {
    if (typeof value === "number") {
        return new BigNumber(value, JsNumberContext);
    }
    else {
        return value;
    }
}

type MatrixSetFunction = (r: number, c: number) => CellInputValue;
type MatrixMapFunction = (cell: EvalValue, r: number, c: number) => CellInputValue;

export const MatrixSetZero: MatrixSetFunction = () => 0;
export const MatrixSetOne: MatrixSetFunction = () => 1;
export const MatrixSetIdentity: MatrixSetFunction = (r, c) => r === c ? 1 : 0;

export const isMatrix = (a: unknown): a is Matrix => a instanceof Matrix;

export class Matrix {
    private readonly rows: EvalValue[][];

    constructor(public readonly nrows: number, public readonly ncols: number, setFn: MatrixSetFunction) {
        this.rows = [];

        Assert.isIntegerGte(this.nrows, 1, "nrows");
        Assert.isIntegerGte(this.ncols, 1, "ncols");

        this.rows = new Array(this.nrows);
        for (let i = 0; i < this.nrows; i++) {
            let row = this.rows[i] = new Array<EvalValue>(this.ncols);
            for (let j = 0; j < this.ncols; j++) {
                row[j] = cellInputToEvalValue(setFn(i, j));
            }
        }
    }

    cell(row: number, col: number, value?: CellInputValue): EvalValue {
        Assert.isIntegerBetween(row, 0, this.nrows - 1, "row");
        Assert.isIntegerBetween(col, 0, this.ncols - 1, "row");

        if (value !== undefined) {
            return this.rows[row][col] = cellInputToEvalValue(value);
        }
        else {
            return this.rows[row][col];
        }
    }

    isSquare() {
        return this.nrows === this.ncols;
    }

    map(mapFn: MatrixMapFunction): Matrix {
        return new Matrix(this.nrows, this.ncols, (r, c) => mapFn(this.cell(r, c), r, c));
    }

    removeRowAndColumn(row: number, col: number): Matrix {
        Assert.isIntegerGt(this.nrows, 1);
        Assert.isIntegerGt(this.ncols, 1);
        return new Matrix(this.nrows - 1, this.ncols - 1, (r, c) => {
            return this.cell(r >= row ? (r + 1) : r, c >= col ? (c + 1) : c);
        });
    }

    transpose() {
        return new Matrix(this.ncols, this.nrows, (i, j) => this.cell(j, i));
    }
}