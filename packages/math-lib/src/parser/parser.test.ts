import { Grammar } from "./grammar";
import { lexer } from "./parser";

describe("parser", () => {

    it("lexer", () => {
        const lextest = (input: string) => lexer(input).filter(tok => tok.type !== Grammar.Rules.END).map(tok => tok.data);

        expect(() => lextest("§")).toThrow();
        expect(lextest("")).toEqual([]);
        expect(lextest("\n\t\r")).toEqual([]);
        expect(lextest(" =:=,.+-*/%⨯!ᵀ^(){}")).toEqual([" ", "=", ":=", ",", ".", "+", "-", "*", "/", "%", "⨯", "!", "ᵀ", "^", "(", ")", "{", "}"]);
        expect(lextest("matrix")).toEqual(["matrix"]);
        expect(lextest("abc αβγ")).toEqual(["abc", " ", "αβγ"]); // ...
    });

});