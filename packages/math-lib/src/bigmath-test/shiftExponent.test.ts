import { BigNumber, NumberArgument } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("shiftExponent", () => {

        let dec_p20 = MC(10, 20);

        function Num(x: NumberArgument) {
            return new BigNumber(x, dec_p20);
        }

        expect(() => Num(7).shiftExponent(NaN)).toThrow();
        expect(() => Num(7).shiftExponent(1.3)).toThrow();
        expect(() => Num(5).shiftExponent(Infinity)).toThrow();
        expect(() => Num(5).shiftExponent(-Infinity)).toThrow();

        expect(Num(NaN).shiftExponent(3)).toEqual(Num(NaN));
        expect(Num(Infinity).shiftExponent(3)).toEqual(Num(Infinity));
        expect(Num(Infinity).shiftExponent(-3)).toEqual(Num(Infinity));
        expect(Num(0).shiftExponent(9)).toEqual(Num(0));
        expect(Num(0).shiftExponent(-9)).toEqual(Num(0));

        expect(Num(4).shiftExponent(0)).toEqual(Num(4));
        expect(Num(4).shiftExponent(3)).toEqual(Num(4e+3));
        expect(Num(4).shiftExponent(-3)).toEqual(Num(4e-3));

    });
});
