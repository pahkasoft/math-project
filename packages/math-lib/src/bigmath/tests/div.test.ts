import { BigNumber, NumberArgument, MathContext } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("div", () => {

        let dec_p20 = MC(10, 20);

        let dec_p10 = MC(10, 10);
        let dec_p50 = MC(10, 50);
        let dec_pInf = MC(10, Infinity);

        function Num(x: NumberArgument, mc?: MathContext) {
            return new BigNumber(x, mc ?? dec_p20);
        }

        expect(Num(+1).div(+1, dec_p20)).toEqual(Num(+1));
        expect(Num(-1).div(+1, dec_p20)).toEqual(Num(-1));
        expect(Num(+1).div(-1, dec_p20)).toEqual(Num(-1));
        expect(Num(-1).div(-1, dec_p20)).toEqual(Num(+1));

        expect(Num(+0).div(+Infinity, dec_p20)).toEqual(Num(+0));
        expect(Num(-0).div(+Infinity, dec_p20)).toEqual(Num(-0));
        expect(Num(+0).div(-Infinity, dec_p20)).toEqual(Num(-0));
        expect(Num(-0).div(-Infinity, dec_p20)).toEqual(Num(+0));

        expect(Num(0).div(0, dec_p20)).toEqual(Num(NaN));
        expect(Num(3).div(0, dec_p20)).toEqual(Num(Infinity));
        expect(Num(-3).div(0, dec_p20)).toEqual(Num(-Infinity));
        expect(Num(3).div(-0, dec_p20)).toEqual(Num(-Infinity));
        expect(Num(-3).div(-0, dec_p20)).toEqual(Num(Infinity));

        expect(Num(5000).div(8, dec_p20)).toEqual(Num(625));
        expect(Num(500).div(8, dec_p20)).toEqual(Num(62.5));
        expect(Num(50).div(8, dec_p20)).toEqual(Num(6.25));
        expect(Num(5).div(8, dec_p20)).toEqual(Num(0.625));
        expect(Num(0.5).div(8, dec_p20)).toEqual(Num(0.0625));
        expect(Num(0.05).div(8, dec_p20)).toEqual(Num(0.00625));
        expect(Num(0.005).div(8, dec_p20)).toEqual(Num(0.000625));

        expect(Num(5).div(800, dec_p20)).toEqual(Num(0.00625));
        expect(Num(5).div(80, dec_p20)).toEqual(Num(0.0625));
        expect(Num(5).div(8, dec_p20)).toEqual(Num(0.625));
        expect(Num(5).div(0.8, dec_p20)).toEqual(Num(6.25));
        expect(Num(5).div(0.08, dec_p20)).toEqual(Num(62.5));
        expect(Num(5).div(0.008, dec_p20)).toEqual(Num(625));

        expect(Num(2).div(-8, dec_p20)).toEqual(Num("-2.5e-1"));
        expect(Num(0.13).div(0.08, dec_p20)).toEqual(Num("+1.625"));

        expect(() => Num(-3).div(-9, dec_pInf)).toThrow();
        expect(Num(-3).div(-9, dec_p50)).toEqual(Num("+3.3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333e-1", dec_p50));

        expect(() => Num(-6).div(9, dec_pInf)).toThrow();
        expect(Num(-6).div(9, dec_p50)).toEqual(Num("-6.6666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666666e-1", dec_p50));

        expect(Num("846204.8175", dec_p10).div("60.13641873", dec_p10)).toEqual(Num("14071.4202", dec_p10));
        expect(Num("3021847.564", dec_p10).div("238973.4567", dec_p10)).toEqual(Num("12.64511802", dec_p10));

    });
});
