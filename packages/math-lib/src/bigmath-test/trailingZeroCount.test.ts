import { BigNumber, NumberArgument } from "bigmath";
import { MC } from "./helpers/common";

describe(BigNumber.name, () => {
    it("trailingZeroCount", () => {

        let dec_p20 = MC(10, 20);

        function Num(x: NumberArgument) {
            return new BigNumber(x, dec_p20);
        }
        
        expect(Num(NaN).trailingZeroCount).toEqual(NaN);
        expect(Num(Infinity).trailingZeroCount).toEqual(NaN);
        expect(Num(-Infinity).trailingZeroCount).toEqual(NaN);

        expect(Num(0).trailingZeroCount).toEqual(0);
        expect(Num(-0).trailingZeroCount).toEqual(0);

        expect(Num(1).trailingZeroCount).toEqual(0);
        expect(Num(-1).trailingZeroCount).toEqual(0);

        expect(Num(12300).trailingZeroCount).toEqual(2);
        expect(Num(-12300).trailingZeroCount).toEqual(2);

        expect(Num(0.0123).trailingZeroCount).toEqual(0);
        expect(Num(-0.0123).trailingZeroCount).toEqual(0);

    });
});
