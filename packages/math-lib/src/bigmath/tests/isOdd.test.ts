import { BigNumber, NumberArgument, MathContext } from "..";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("isOdd", () => {

        let b6_p20 = MC(6, 20);
        let b7_p20 = MC(7, 20);
        let dec_p20 = MC(10, 20);

        function isOdd(x: NumberArgument, mc?: MathContext) {
            return new BigNumber(x, mc ?? dec_p20).isOdd();
        }

        expect(isOdd(NaN)).toEqual(false);
        expect(isOdd(Infinity)).toEqual(false);

        expect(isOdd(0)).toEqual(false);
        expect(isOdd(1)).toEqual(true);
        expect(isOdd(-1)).toEqual(true);
        expect(isOdd(2)).toEqual(false);

        expect(isOdd(2.4)).toEqual(false);
        expect(isOdd(2.5)).toEqual(false); 2

        expect(isOdd("324512", b6_p20)).toEqual(false);
        expect(isOdd("324513", b6_p20)).toEqual(true);

        expect(isOdd("1234541", b7_p20)).toEqual(false);
        expect(isOdd("1234542", b7_p20)).toEqual(true);
        expect(isOdd("1234531", b7_p20)).toEqual(true);
        expect(isOdd("1234532", b7_p20)).toEqual(false);

        expect(isOdd("10", b6_p20)).toEqual(false);
        expect(isOdd("20", b6_p20)).toEqual(false);

        expect(isOdd("10", b7_p20)).toEqual(true);
        expect(isOdd("20", b7_p20)).toEqual(false);

    });
});
