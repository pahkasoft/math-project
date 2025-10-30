import { BigNumber, NumberArgument, MathContext } from "..";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("constructor", () => {

        let bin_p20 = MC(2, 20);
        let b3_p20 = MC(3, 20);
        let b4_p20 = MC(4, 20);
        let b5_p20 = MC(5, 20);
        let oct_p20 = MC(8, 20);
        let dec_p20 = MC(10, 20);

        function Num(x: NumberArgument, mc?: MathContext) {
            return new BigNumber(x, mc ?? dec_p20);
        }

        expect(Num("")).toEqual(Num(0));
        expect(Num("  ")).toEqual(Num(0));
        expect(Num("  123  ")).toEqual(Num(123));

        expect(Num("000")).toEqual(Num(0));
        expect(Num("0000.")).toEqual(Num(0));
        expect(Num(".0000")).toEqual(Num(0));
        expect(Num("000.00")).toEqual(Num(0));
        expect(Num("000123.456000")).toEqual(Num("123.456"));

        expect(Num(0, bin_p20)).toEqual(Num("0", bin_p20));
        expect(Num(-0, b3_p20)).toEqual(Num("-0", b3_p20));
        expect(Num(1, b4_p20)).toEqual(Num("1", b4_p20));
        expect(Num(-1, b5_p20)).toEqual(Num("-1", b5_p20));

        expect(Num(Num(NaN))).toEqual(Num(NaN));
        expect(Num(Num(Infinity))).toEqual(Num(Infinity));
        expect(Num(Num(-Infinity))).toEqual(Num(-Infinity));
        expect(Num(Num(5))).toEqual(Num(5));

        expect(Num("1001&b=2", dec_p20)).toEqual(Num(9));
        expect(Num("12&b=8", dec_p20)).toEqual(Num(10));

        expect(Num(12, oct_p20)).toEqual(Num("14", oct_p20));
        expect(Num(10, bin_p20)).toEqual(Num("1010", bin_p20));

        // Invalid Number Format
        expect(Num("(NaN)")).toEqual(Num(NaN));
        expect(Num("?")).toEqual(Num(NaN));
        expect(Num("!")).toEqual(Num(NaN));
        expect(Num("123&b=-1")).toEqual(Num(NaN));
        expect(Num("123&b=3.5")).toEqual(Num(NaN));
        expect(Num("123&b=50")).toEqual(Num(NaN));
        expect(Num("123&e=1.2")).toEqual(Num(NaN));
        expect(Num("123&e=bb")).toEqual(Num(NaN));
        expect(Num("123&e=9&b=8", dec_p20)).toEqual(Num(NaN, dec_p20));
        expect(Num("123&e=9", oct_p20)).toEqual(Num(NaN, oct_p20));
    });
});
