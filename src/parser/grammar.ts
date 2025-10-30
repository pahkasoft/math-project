import Fmt from "@tspro/brace-format";
import { Vocabulary, Symbols } from "./vocabulary";

export namespace Grammar {
    const _symbols = Symbols.All;
    const _09 = "0-9";
    const _09azAZ = "0-9a-zA-Z";

    const NumberRule = new RegExp(Fmt.format("^∞|(([{0}][{1}]*\\.?[{1}]*)|(\\.[{1}]*))", _09, _09azAZ));
    const VariableRule = new RegExp(Fmt.format("^([{0}][{0}{1}]*)", _symbols, _09));
    const SymbolSequenceRule = new RegExp(Fmt.format("^[∞.{0}{1}]+", _symbols, _09));

    const ReservedWords: string[] = [
        Vocabulary.ans,
        Vocabulary.summation,
        Vocabulary.product,
        Vocabulary.frac,
        Vocabulary.abs,
        Vocabulary.log,
        Vocabulary.sqrt,
        Vocabulary.nthroot,
        Vocabulary.matrix,
    ];

    export const Rules = {
        DISCARD: new RegExp("^[\t\n\r]"),
        SPACE: new RegExp("^[ ]"),
        EQUAL: new RegExp("^[=≈]"),
        DECLARE: new RegExp("^\\:\\="),
        COMMA: new RegExp("^\\,"),
        ADD: new RegExp("^\\+"),
        SUBTRACT: new RegExp("^(\\-)"),
        MULTIPLY: new RegExp("^(\\*)"),
        DIVIDE: new RegExp("^\\/"),
        MODULO: new RegExp("^\\%"),
        CROSS_PRODUCT: new RegExp("^\\⨯"),
        FACTORIAL: new RegExp("^\\!"),
        TRANSPOSE: new RegExp("^ᵀ"),
        EXPONENT: new RegExp("^\\^"),
        ROUND_BRACKET_LEFT: new RegExp("^\\("),
        ROUND_BRACKET_RIGHT: new RegExp("^\\)"),
        CURLY_BRACKET_LEFT: new RegExp("^\\{"),
        CURLY_BRACKET_RIGHT: new RegExp("^\\}"),
        MATRIX: new RegExp("^matrix(?=\\{)"), // Lookahead that "matrix" is followed by "{"
        SYMBOL_SEQUENCE: SymbolSequenceRule,
        END: new RegExp("^\\b$"), // Never match. 
    }

    export function testRule(str: string, ...rules: RegExp[]) {
        return rules.some(rule => str === (rule.exec(str) || [])[0]);
    }

    export function isNumber(str: string): boolean {
        return Grammar.testRule(str, NumberRule);
    }

    export function isVariable(str: string) {
        return Grammar.testRule(str, VariableRule);
    }

    export function isReservedWord(word: string) {
        return ReservedWords.indexOf(word) > -1;
    }
}

