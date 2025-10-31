import { Nodes } from "@tspro/math-lib/engine";
import { Grammar } from "./grammar";
import { Assert, Utils } from "@tspro/ts-utils-lib";
import Fmt from "@tspro/brace-format";

function throwError(errorMsg: string, line: string, column?: number): never {
    let err;
    if (column !== undefined) {
        let ptr = Utils.Str.repeatString(" ", column) + "^";
        err = Fmt.format("[Error Pos {}]: {}\n{}\n{}", column, errorMsg, line, ptr);
    }
    else {
        err = Fmt.format("[Error At Line]: {}\n{}", errorMsg, line);
    }
    Assert.fail(err);
}

class Token {
    constructor(readonly type: RegExp, readonly data: string, readonly line: string, readonly column: number) { }

    static EndToken(line: string = "", column: number = 0) {
        return new Token(Grammar.Rules.END, "", line, column);
    }
}

export function lexer(input: string): Token[] {

    let tokens: Token[] = [];
    let str = input;
    let column = 0;

    let RuleNames = Object.keys(Grammar.Rules);

    while (str.length > 0) {

        let rule, data;

        for (let i = 0; !data && i < RuleNames.length; i++) {
            rule = (Grammar.Rules as any)[RuleNames[i]];
            if (rule instanceof RegExp) {
                let match = rule.exec(str);
                data = match && match[0] ? match[0] : undefined;
            }
        }

        if (data) {
            let token = new Token(rule, data, input, column);

            if (rule !== Grammar.Rules.DISCARD) {
                tokens.push(token);
            }

            str = str.substring(token.data.length);
            column += token.data.length;
        }
        else {
            throwError("Unrecognized char", input, column);
        }
    }

    // Add EndToken
    tokens.push(Token.EndToken(input, column));

    return tokens;
}

export class Parser {
    private tokens: Token[];
    private lookAhead: Token;

    private constructor(input: string | Token[]) {
        if (typeof input === "string") {
            this.tokens = lexer(input);
        }
        else {
            this.tokens = input.slice();
        }
        this.lookAhead = this.nextToken();
    }

    static parseExpression(input: string | Token[]): Nodes.NExpression {
        let parser = new Parser(input);
        let expr = parser.parseExpression();

        if (parser.lookAhead.type !== Grammar.Rules.END && parser.lookAhead.type !== Grammar.Rules.EQUAL) {
            console.warn("Unhandled data after expression.");
        }

        return expr;
    }

    private throwError(msg: string, token?: Token): never {
        token = token || this.lookAhead;
        throwError(msg, token.line, token.column);
    }

    private nextToken() {
        return this.lookAhead = this.tokens.shift() || Token.EndToken();
    }

    private parseExpression(): Nodes.NExpression {
        let expr = new Nodes.NExpression();

        while (
            this.parseSpaces(expr) ||
            this.parseTermOp(expr) ||
            this.parseFactorOp(expr) ||
            this.parseFactorial(expr) ||
            this.parseTranspose(expr) ||
            this.parseExponent(expr) ||
            this.parseDeclare(expr) ||
            this.parseComma(expr) ||
            this.parseMatrix(expr) ||
            this.parseSymbols(expr) ||
            this.parseBrackets(expr)
        );

        return expr;
    }

    private parseSpaces(expr?: Nodes.NExpression): boolean {
        let ok = false;
        while (this.lookAhead.type === Grammar.Rules.SPACE) {
            new Nodes.NSpace().addTo(expr);
            this.nextToken();
            ok = true;
        }
        return ok;
    }

    private parseTermOp(expr: Nodes.NExpression): boolean {
        if (this.lookAhead.type === Grammar.Rules.ADD || this.lookAhead.type === Grammar.Rules.SUBTRACT) {
            new Nodes.NTermOp(this.lookAhead.data).addTo(expr);
            this.nextToken();
            return true;
        }
        else {
            return false;
        }
    }

    private parseFactorOp(expr: Nodes.NExpression): boolean {
        if (this.lookAhead.type === Grammar.Rules.MULTIPLY ||
            this.lookAhead.type === Grammar.Rules.DIVIDE ||
            this.lookAhead.type === Grammar.Rules.MODULO ||
            this.lookAhead.type === Grammar.Rules.CROSS_PRODUCT) {
            new Nodes.NFactorOp(this.lookAhead.data).addTo(expr);
            this.nextToken();
            return true;
        }
        else {
            return false;
        }
    }

    private parseFactorial(expr: Nodes.NExpression): boolean {
        if (this.lookAhead.type === Grammar.Rules.FACTORIAL) {
            new Nodes.NFactorial().addTo(expr);
            this.nextToken();
            return true;
        }
        else {
            return false;
        }
    }

    private parseTranspose(expr: Nodes.NExpression): boolean {
        if (this.lookAhead.type === Grammar.Rules.TRANSPOSE) {
            new Nodes.NTranspose().addTo(expr);
            this.nextToken();
            return true;
        }
        else {
            return false;
        }
    }

    private parseExponent(expr: Nodes.NExpression): boolean {
        if (this.lookAhead.type !== Grammar.Rules.EXPONENT) {
            return false;
        }
        let powToken = this.lookAhead;
        this.nextToken();
        let arg = this.parseExponentValue();
        if (!arg) {
            this.throwError("Invalid exponent.", powToken);
        }
        new Nodes.NExponent(arg).addTo(expr);
        return true;
    }

    private parseExponentValue(): Nodes.NExpression {
        let expr = this.parseExpressionInCurlyBrackets();
        if (expr) {
            return expr; // Normal exponent in {...}
        }
        expr = this.parseExpressionInRoundBrackets();
        if (expr) {
            return expr; // Normal exponent in (...)
        }
        expr = new Nodes.NExpression();
        this.parseTermOp(expr);
        let ok = false;
        while (this.parseSymbols(expr, true)) { ok = true; }
        if (ok) {
            return expr;
        }
        else {
            this.throwError("Use curly or round brackets.");
        }
    }

    private parseDeclare(expr: Nodes.NExpression): boolean {
        if (this.lookAhead.type === Grammar.Rules.DECLARE) {
            new Nodes.NDeclare().addTo(expr);
            this.nextToken();
            return true;
        }
        else {
            return false;
        }
    }

    private parseComma(expr: Nodes.NExpression): boolean {
        if (this.lookAhead.type === Grammar.Rules.COMMA) {
            new Nodes.NComma().addTo(expr);
            this.nextToken();
            return true;
        }
        else {
            return false;
        }
    }

    private parseMatrix(expr: Nodes.NExpression): boolean {
        if (this.lookAhead.type !== Grammar.Rules.MATRIX) {
            return false;
        }
        this.nextToken();

        let cells: Nodes.NExpression[][] = [];

        while (this.lookAhead.type === Grammar.Rules.CURLY_BRACKET_LEFT) {
            this.nextToken();

            let row: Nodes.NExpression[] = [];
            let cell;
            while (cell = this.parseExpressionInCurlyBrackets()) {
                row.push(cell);
            }

            cells.push(row);

            Assert.assert(this.lookAhead.type == Grammar.Rules.CURLY_BRACKET_RIGHT, "Expected \"}\"");

            this.nextToken();
        }

        let rows = cells.length;
        let cols = cells.length > 0 ? cells[0].length : 0;

        Assert.isIntegerGte(rows, 1, "Invalid rows.");
        Assert.isIntegerGte(cols, 1, "Invalid cols.");
        Assert.assert(cells.every(row => row.length === cols), "Matrix row lengths vary.");

        new Nodes.NMatrix(rows, cols).setCells(cells).addTo(expr);
        return true;
    }

    private parseSymbols(expr: Nodes.NExpression, simpleExponent: boolean = false): boolean {
        if (this.lookAhead.type !== Grammar.Rules.SYMBOL_SEQUENCE) {
            return false;
        }

        let symbolsToken = this.lookAhead;
        let symbolsStr = this.lookAhead.data;
        this.nextToken();

        if (!simpleExponent && this.lookAhead.type === Grammar.Rules.ROUND_BRACKET_LEFT) {
            let arg = this.parseExpressionInRoundBrackets();
            if (!arg) {
                this.throwError("Function arg required.", symbolsToken);
            }

            Utils.Str.toCharArray(symbolsStr).forEach(sym => new Nodes.NSymbol(sym).addTo(expr));
            expr.addNodes(new Nodes.NBracket().setArgs(arg));
        }
        else if (!simpleExponent && this.lookAhead.type === Grammar.Rules.CURLY_BRACKET_LEFT) {
            let args: Nodes.NExpression[] = [], e;
            while (e = this.parseExpressionInCurlyBrackets()) { args.push(e); }

            // Create decorated function
            let fnode = Nodes.createDecoratedFunction(symbolsStr, args);
            if (fnode) {
                fnode.addTo(expr);
            }
            else {
                this.throwError("Invalid decorated function.", symbolsToken);
            }
        }
        else {
            Utils.Str.toCharArray(symbolsStr).forEach(sym => new Nodes.NSymbol(sym).addTo(expr));
        }
        return true;
    }

    private parseBrackets(expr: Nodes.NExpression): boolean {
        let e = this.parseExpressionInRoundBrackets();
        if (e) {
            new Nodes.NBracket().setArgs(e).addTo(expr);
            return true;
        }
        else {
            return false;
        }
    }

    private parseExpressionInRoundBrackets(): Nodes.NExpression | undefined {
        if (this.lookAhead.type !== Grammar.Rules.ROUND_BRACKET_LEFT) {
            return undefined;
        }
        this.nextToken();

        let expr = this.parseExpression();

        if (this.lookAhead.type !== Grammar.Rules.ROUND_BRACKET_RIGHT) {
            this.throwError("Expected \")\"");
        }

        this.nextToken();

        return expr;
    }

    private parseExpressionInCurlyBrackets(): Nodes.NExpression | undefined {
        if (this.lookAhead.type !== Grammar.Rules.CURLY_BRACKET_LEFT) {
            return undefined;
        }
        this.nextToken();

        let expr = this.parseExpression();

        if (this.lookAhead.type !== Grammar.Rules.CURLY_BRACKET_RIGHT) {
            this.throwError("Expected \"}\"");
        }
        this.nextToken();

        return expr;
    }

}
