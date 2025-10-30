import { BigNumber, NumberArgument } from "..";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("decimalPlaces", () => {

        let dec_p20 = MC(10, 20);

        function Num(x: NumberArgument) {
            return new BigNumber(x, dec_p20);
        }

        expect(Num(NaN).decimalPlaces).toEqual(NaN);
        expect(Num(Infinity).decimalPlaces).toEqual(NaN);
        expect(Num(-Infinity).decimalPlaces).toEqual(NaN);

        expect(Num(0).decimalPlaces).toEqual(0);
        expect(Num(-0).decimalPlaces).toEqual(0);

        expect(Num(1).decimalPlaces).toEqual(0);
        expect(Num(-1).decimalPlaces).toEqual(0);

        expect(Num(12300).decimalPlaces).toEqual(0);
        expect(Num(-12300).decimalPlaces).toEqual(0);

        expect(Num(0.0123).decimalPlaces).toEqual(4);
        expect(Num(-0.0123).decimalPlaces).toEqual(4);

    });
});
