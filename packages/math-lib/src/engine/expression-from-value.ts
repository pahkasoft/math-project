import { Nodes } from "engine/nodes";
import { Parser } from "parser";
import { Assert } from "@tspro/ts-utils-lib";
import { BigNumber, isNumberArgument, MathContext, RoundingMode } from "bigmath";
import { Matrix } from "eval";

function fixDigits(digits: string) {
    // Begin digits with 0 if first digit is letter (base > 10)
    return (/^[a-zA-Z]/.test(digits) ? "0" : "") + digits;
}

class ExpressionCreator {
    mc: MathContext;

    constructor(private displayBase: number, private displayPrecision: number) {
        this.mc = new MathContext(displayBase, displayPrecision, RoundingMode.HalfUp);
    }

    createExpression(x: number | string | BigNumber | Matrix, insertEqualSymbol: boolean): Nodes.NExpression {
        if (isNumberArgument(x)) {
            x = BigNumber.convert(x, this.mc);
        }

        let result;

        if (x instanceof BigNumber) {
            result = this.createNumberExpression(x);
        }
        else if (x instanceof Matrix) {
            result = this.createMatrixExpression(x);
        }
        else {
            Assert.interrupt("Result is needed.");
        }

        if (insertEqualSymbol) {
            result.insertNodes(0, new Nodes.NEqual("="));
        }

        return result;
    }

    private createMatrixExpression(x: Matrix): Nodes.NExpression {
        let cellData: Nodes.NExpression[][] = new Array(x.nrows);

        for (let i = 0; i < x.nrows; i++) {
            let rowData = cellData[i] = new Array(x.ncols);
            for (let j = 0; j < x.ncols; j++) {
                rowData[j] = this.createExpression(x.cell(i, j), false);
            }
        }

        let matrixNode = new Nodes.NMatrix(x.nrows, x.ncols).setCells(cellData);
        return new Nodes.NExpression(matrixNode);
    }

    private createNumberExpression(x: BigNumber): Nodes.NExpression {
        Assert.assert(!x.isNaN(), "Create expression from NaN.");

        let displayMC = new MathContext(this.displayBase, this.displayPrecision, RoundingMode.HalfUp);

        x = x.convert(displayMC);

        let str = x.toUserFriendlyString();

        let p = Assert.require(BigNumber.parse(str));

        if (p.exponent.startsWith("+") || p.exponent === "-0") {
            p.exponent = p.exponent.substring(1);
        }

        let sign = p.sign;
        let digits = fixDigits(p.digits);
        let exp = p.exponent ? ("*10^" + fixDigits(p.exponent)) : "";

        return Parser.parseExpression(sign + digits + exp);
    }
}

export function expressionFromValue(displayBase: number, displayPrecision: number, x: number | string | BigNumber | Matrix, insertEqualSymbol = false) {
    return new ExpressionCreator(displayBase, displayPrecision).createExpression(x, insertEqualSymbol);
}
