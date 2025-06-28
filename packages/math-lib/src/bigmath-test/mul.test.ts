import { BigNumber, NumberArgument, MathContext } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("mul", () => {

        let dec_p20 = MC(10, 20);

        function d(x: NumberArgument, mc?: MathContext) {
            return new BigNumber(x, mc ?? dec_p20);
        }

        expect(d(5).mul(NaN, dec_p20)).toEqual(d(NaN));
        expect(d(NaN).mul(5, dec_p20)).toEqual(d(NaN));
        expect(d(NaN).mul(NaN, dec_p20)).toEqual(d(NaN));

        expect(d(5).mul(Infinity, dec_p20)).toEqual(d(Infinity));
        expect(d(5).mul(-Infinity, dec_p20)).toEqual(d(-Infinity));
        expect(d(Infinity).mul(5, dec_p20)).toEqual(d(Infinity));
        expect(d(-Infinity).mul(5, dec_p20)).toEqual(d(-Infinity));
        expect(d(Infinity).mul(Infinity, dec_p20)).toEqual(d(Infinity));
        expect(d(-Infinity).mul(Infinity, dec_p20)).toEqual(d(-Infinity));
        expect(d(Infinity).mul(-Infinity, dec_p20)).toEqual(d(-Infinity));
        expect(d(-Infinity).mul(-Infinity, dec_p20)).toEqual(d(Infinity));

        expect(d(0).mul(0, dec_p20)).toEqual(d(0));
        expect(d(-0).mul(0, dec_p20)).toEqual(d(-0));
        expect(d(0).mul(-0, dec_p20)).toEqual(d(-0));
        expect(d(-0).mul(-0, dec_p20)).toEqual(d(0));

        expect(d(1).mul(1, dec_p20)).toEqual(d(1));
        expect(d(-1).mul(1, dec_p20)).toEqual(d(-1));
        expect(d(1).mul(-1, dec_p20)).toEqual(d(-1));
        expect(d(-1).mul(-1, dec_p20)).toEqual(d(1));

        expect(d(3).mul(5, dec_p20)).toEqual(d(15));
        expect(d(-3).mul(5, dec_p20)).toEqual(d(-15));
        expect(d(3).mul(-5, dec_p20)).toEqual(d(-15));
        expect(d(-3).mul(-5, dec_p20)).toEqual(d(15));

        expect(d(0.01234).mul(56.78, dec_p20)).toEqual(d(0.7006652));
        expect(d(0.1234).mul(56.78, dec_p20)).toEqual(d(7.006652));
        expect(d(1.234).mul(56.78, dec_p20)).toEqual(d(70.06652));
        expect(d(12.34).mul(56.78, dec_p20)).toEqual(d(700.6652));
        expect(d(123.4).mul(56.78, dec_p20)).toEqual(d(7006.652));
        expect(d(1234).mul(56.78, dec_p20)).toEqual(d(70066.52));
        expect(d(12340).mul(56.78, dec_p20)).toEqual(d(700665.2));
        expect(d(123400).mul(56.78, dec_p20)).toEqual(d(7006652));

    });
});
