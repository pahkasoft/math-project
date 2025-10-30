import { BigNumber, NumberArgument, MathContext } from "..";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("isEven", () => {

        let b6_p20 = MC(6, 20);
        let b7_p20 = MC(7, 20);
        let dec_p20 = MC(10, 20);

        function isEven(x: NumberArgument, mc?: MathContext) {
            return new BigNumber(x, mc ?? dec_p20).isEven();
        }

        expect(isEven(NaN)).toEqual(false);
        expect(isEven(Infinity)).toEqual(false);

        expect(isEven(0)).toEqual(true);
        expect(isEven(1)).toEqual(false);
        expect(isEven(-1)).toEqual(false);
        expect(isEven(2)).toEqual(true);

        expect(isEven(2.4)).toEqual(false);
        expect(isEven(2.5)).toEqual(false);

        expect(isEven("324512", b6_p20)).toEqual(true);
        expect(isEven("324513", b6_p20)).toEqual(false);

        expect(isEven("1234541", b7_p20)).toEqual(true);
        expect(isEven("1234542", b7_p20)).toEqual(false);
        expect(isEven("1234531", b7_p20)).toEqual(false);
        expect(isEven("1234532", b7_p20)).toEqual(true);

        expect(isEven("10", b6_p20)).toEqual(true);
        expect(isEven("20", b6_p20)).toEqual(true);

        expect(isEven("10", b7_p20)).toEqual(false);
        expect(isEven("20", b7_p20)).toEqual(true);

    });
});
