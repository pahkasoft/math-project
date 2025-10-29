import { BigNumber, NumberArgument } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("digitCount", () => {

        let dec_p20 = MC(10, 20);

        function Num(x: NumberArgument) {
            return new BigNumber(x, dec_p20);
        }

        expect(Num(NaN).digitCount).toEqual(NaN);
        expect(Num(Infinity).digitCount).toEqual(NaN);
        expect(Num(-Infinity).digitCount).toEqual(NaN);

        expect(Num(0).digitCount).toEqual(1);
        expect(Num(-0).digitCount).toEqual(1);

        expect(Num(1).digitCount).toEqual(1);
        expect(Num(-1).digitCount).toEqual(1);

        expect(Num(12300).digitCount).toEqual(3);
        expect(Num(-12300).digitCount).toEqual(3);

        expect(Num(0.0123).digitCount).toEqual(3);
        expect(Num(-0.0123).digitCount).toEqual(3);

    });
});
